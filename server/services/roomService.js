/**
 * Service for handling rooms.
 */
define([
    "underscore",
    "server/models/Room",
    "server/session/sessionStore",
    "server/utils/parallel",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    Room,
    sessionStore,
    parallel,
    FeedbackException,
    IllegalArgumentException,
    IllegalStateException,
    ProtocolException
) {
    "use strict";

    var RoomService = function () {
        this._rooms = {};

        this._createRoom("ponyverse");
    };

    RoomService.prototype._createRoom = function (name) {
        this._rooms[name] = new Room(name);
    };

    RoomService.prototype.getRoomNames = function (callback) {
        return callback(null, _.keys(this._rooms));
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

    RoomService.prototype._withEachMembersMessageSink = function (room, memberCallback, callback) {
        var members = room.getMembers();
        var nicks = members; // currently a room only holds the nicks of the members

        sessionStore.findByNicks(nicks, function (err, sessions) {
            if (err) {
                return callback(err);
            }

            parallel.each(sessions, function (memberSession, next) {
                var messageSink = memberSession.getMessageSink();
                memberCallback(messageSink, next);
            }.bind(this), callback);
        }.bind(this));
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

            sessionStore.findByNicks(room.getMembers(), function (err, memberSessions) {
                if (err) {
                    return callback(err);
                }

                parallel.mapFilter(memberSessions, function (memberSession, next) {
                    if (memberSession.isLoggedIn()) {
                        return next(null, memberSession.getUser().toPublicUser());
                    }

                    return next(null, null); // do not include
                }, function (err, publicUsers) {
                    if (err) {
                        return callback(err);
                    }

                    session.get("messageSink").sendRoomInfo(roomName, publicUsers);

                    this._withEachMembersMessageSink(room, function (messageSink, next) {
                        messageSink.sendUserJoinedRoom(roomName, user.toPublicUser());
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

    RoomService.prototype.sendMessage = function (session, roomName, text, callback) {
        this.getByName(roomName, function (err, room) {
            if (err) {
                return callback(err);
            }

            var nick = session.getUser().getNick();

            if (!room.isMember(nick)) {
                return callback(new FeedbackException("You are not a member of that room: " + roomName));
            }

            this._withEachMembersMessageSink(room, function (messageSink, next) {
                messageSink.sendRoomMessage(roomName, nick, text);
                next(null);
            }.bind(this), callback);
        }.bind(this));
    };

    RoomService.prototype.moveMember = function (session, roomName, position, callback) {
        this.getByName(roomName, function (err, room) {
            if (err) {
                return callback(err);
            }

            var nick = session.getUser().getNick();

            if (!room.isMember(nick)) {
                return callback(new FeedbackException("You are not a member of that room: " + roomName));
            }

            // TODO: Check if position allowed in that room.

            this._withEachMembersMessageSink(room, function (messageSink, next) {
                messageSink.sendMoved(roomName, nick, position);
                next(null);
            }.bind(this), callback);
        }.bind(this));
    };

    return new RoomService();
});

