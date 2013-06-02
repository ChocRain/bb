/**
 * Service for handling rooms.
 */
define([
    "underscore",
    "server/models/Room",
    "server/session/sessionStore",
    "server/utils/parallel",
    "shared/models/RoomMember",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException",
    "shared/exceptions/ProtocolException",
    "json!shared/definitions/avatars.json",
    "json!shared/definitions/rooms.json"
], function (
    _,
    Room,
    sessionStore,
    parallel,
    RoomMember,
    FeedbackException,
    IllegalArgumentException,
    IllegalStateException,
    ProtocolException,
    avatars,
    roomData
) {
    "use strict";

    var RoomService = function () {
        this._sortedRoomNames = [];
        this._rooms = {};

        _.each(roomData.rooms, this._createRoom.bind(this));
    };

    RoomService.prototype._createRoom = function (roomEntry) {
        this._rooms[roomEntry.name] = new Room(
            roomEntry.name,
            roomEntry.width,
            roomEntry.height
        );
        this._sortedRoomNames.push(roomEntry.name);
    };

    RoomService.prototype.getRoomNames = function (callback) {
        return callback(null, this._sortedRoomNames);
    };

    RoomService.prototype.getByName = function (roomName, callback) {
        var room = this._rooms[roomName];

        if (!room) {
            return callback(new FeedbackException("No such room: " + roomName));
        }

        if (!(room instanceof Room)) {
            return callback(new IllegalStateException("A room must be instance of Room: " + roomName));
        }

        return callback(null, room);
    };

    RoomService.prototype.findByNick = function (nick, callback) {
        var rooms = _.filter(this._rooms, function (room) {
            return room.isMember(nick);
        }, this);

        return callback(null, rooms);
    };

    RoomService.prototype._withEachMembersSession = function (room, memberCallback, callback) {
        var members = room.getMembers();
        var nicks = members; // currently a room only holds the nicks of the members

        sessionStore.findByNicks(nicks, function (err, sessions) {
            if (err) {
                return callback(err);
            }

            parallel.each(sessions, memberCallback, callback);
        }.bind(this));
    };

    RoomService.prototype._withEachMembersMessageSink = function (room, memberCallback, callback) {
        this._withEachMembersSession(room, function (memberSession, next) {
            var messageSink = memberSession.getMessageSink();
            memberCallback(messageSink, next);
        }.bind(this), callback);
    };

    RoomService.prototype.join = function (session, roomName, callback) {
        if (!_.isString(roomName)) {
            return callback(new IllegalArgumentException("Room name must be a string: " + roomName));
        }

        this.getByName(roomName, function (err, room) {
            if (err) {
                return callback(err);
            }
            var user = session.getUser();
            var nick = user.getNick();

            if (room.isMember(nick)) {
                return callback(new FeedbackException("You are already in that room: " + roomName));
            }

            room.join(nick);
            session.set("position", {x: 400, y: 400, direction: "right"});
            session.set("avatar", _.keys(avatars.sprites)[0]);

            sessionStore.findByNicks(room.getMembers(), function (err, memberSessions) {
                if (err) {
                    return callback(err);
                }

                parallel.mapFilter(memberSessions, function (memberSession, next) {
                    if (memberSession.isLoggedIn()) {
                        var publicUser = memberSession.getUser().toPublicUser();
                        var position = memberSession.get("position");
                        var avatar = memberSession.get("avatar");

                        return next(null, new RoomMember(publicUser, position, avatar));
                    }

                    return next(null, null); // do not include
                }, function (err, roomMembers) {
                    if (err) {
                        return callback(err);
                    }

                    session.get("messageSink").sendRoomInfo(roomName, roomMembers);

                    var roomMember = new RoomMember(
                        user.toPublicUser(),
                        session.get("position"),
                        session.get("avatar")
                    );

                    this._withEachMembersMessageSink(room, function (messageSink, next) {
                        messageSink.sendUserJoinedRoom(roomName, roomMember);
                        next(null);
                    }.bind(this), callback);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    RoomService.prototype.leaveAllRooms = function (session, callback) {
        var nick = session.getUser().getNick();

        this.findByNick(nick, function (err, rooms) {
            if (err) {
                return callback(err);
            }
            _.each(rooms, function (room) {
                room.leave(nick);

                var roomName = room.getName();

                this._withEachMembersMessageSink(room, function (messageSink, next) {
                    messageSink.sendUserLeftRoom(roomName, nick);
                    next(null);
                }.bind(this), callback);
            }.bind(this));
        }.bind(this));
    };

    RoomService.prototype._withRoomMemberIsIn = function (session, roomName, callback) {
        this.getByName(roomName, function (err, room) {
            if (err) {
                return callback(err);
            }

            var nick = session.getUser().getNick();

            if (!room.isMember(nick)) {
                return callback(new FeedbackException("You are not a member of that room: " + roomName));
            }

            callback(null, room, nick);
        }.bind(this));
    };

    RoomService.prototype.sendMessage = function (session, roomName, text, callback) {
        this._withRoomMemberIsIn(session, roomName, function (err, room, nick) {
            if (err) {
                return callback(err);
            }

            this._withEachMembersSession(room, function (memberSession, next) {
                if (!memberSession.isIgnored(nick)) {
                    memberSession.getMessageSink().sendRoomMessage(roomName, nick, text);
                }
                next(null);
            }.bind(this), callback);
        }.bind(this));
    };

    RoomService.prototype.sendStatusUpdate = function (session, status, callback) {
        var nick = session.getUser().getNick();
        this.findByNick(nick, function (err, rooms) {
            if (err) {
                return callback(err);
            }

            _.each(rooms, function (room) {
                this._withEachMembersMessageSink(room, function (messageSink, next) {
                    messageSink.sendStatusUpdate(nick, status);
                    next(null);
                }.bind(this), callback);
            }.bind(this));

            callback(null);
        }.bind(this));
    };

    RoomService.prototype.moveMember = function (session, roomName, position, callback) {
        this._withRoomMemberIsIn(session, roomName, function (err, room, nick) {
            if (err) {
                return callback(err);
            }

            if (position.x < 0 || position.x > room.getWidth() || position.y < 0 || position.y > room.getHeight()) {
                return callback(new FeedbackException(
                    "That position " + position.x + ":" + position.y +
                            " is not allowed within the room \"" + room.getName() + "\""
                ));
            }

            session.set("position", position);

            this._withEachMembersMessageSink(room, function (messageSink, next) {
                messageSink.sendMoved(roomName, nick, position);
                next(null);
            }.bind(this), callback);
        }.bind(this));
    };

    RoomService.prototype._findAvatar = function (avatarName, callback) {
        var avatar = avatars.sprites[avatarName];
        callback(null, avatar || null);
    };

    RoomService.prototype.changeAvatar = function (session, roomName, avatarName, callback) {
        this._withRoomMemberIsIn(session, roomName, function (err, room, nick) {
            if (err) {
                return callback(err);
            }

            this._findAvatar(avatarName, function (err, avatar) {
                if (err) {
                    return callback(err);
                }

                if (!avatar) {
                    return callback(new ProtocolException(
                        "Invalid avatar: " + avatarName
                    ));
                }

                session.set("avatar", avatarName);

                this._withEachMembersMessageSink(room, function (messageSink, next) {
                    messageSink.sendAvatarChanged(roomName, nick, avatarName);
                    next(null);
                }.bind(this), callback);
            }.bind(this));
        }.bind(this));
    };

    return new RoomService();
});

