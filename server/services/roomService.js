/**
 * Service for handling rooms.
 */
define([
    "underscore",
    "server/models/Room",
    "server/session/sessionStore",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    Room,
    sessionStore,
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
        // FIXME: This a really poor implementation in terms of performance.
        // O(n * m) with n being number of rooms and m the numbers of users.
        var rooms = _.filter(this._rooms, function (room) {
            return room.isMember(nick);
        }, this);

        return callback(null, rooms);
    };

    RoomService.prototype._withEachMembersMessageSink = function (room, callback) {
        var members = room.getMembers();
        var nicks = members; // currently a room only holds the nicks of the members

        _.each(sessionStore.findByNicks(nicks), function (memberSession) {
            var messageSink = memberSession.getMessageSink();
            return callback(messageSink);
        }, this);
    };

    RoomService.prototype.join = function (session, roomName, callback) {
        if (!_.isString(roomName)) {
            return callback(new IllegalArgumentException("Room name must be a string: " + roomName));
        }

        this.getByName(roomName, function (err, room) {
            if (err) {
                return callback(err);
            }
            var nick = session.getNick();

            if (room.isMember(nick)) {
                return callback(new FeedbackException("You are already in that room: " + roomName));
            }

            room.join(nick);

            this._withEachMembersMessageSink(room, function (messageSink) {
                messageSink.sendUserJoinedRoom(roomName, nick);
            }.bind(this));

            return callback(null);
        }.bind(this));
    };

    RoomService.prototype.leaveAllRooms = function (session, callback) {
        var nick = session.getNick();

        this.findByNick(nick, function (err, rooms) {
            if (err) {
                return callback(err);
            }
            _.each(rooms, function (room) {
                room.leave(nick);

                var roomName = room.getName();

                this._withEachMembersMessageSink(room, function (messageSink) {
                    messageSink.sendUserLeftRoom(roomName, nick);
                }.bind(this));
            }, this);

            return callback(null);
        }.bind(this));
    };

    RoomService.prototype.sendMessage = function (session, roomName, text, callback) {
        this.getByName(roomName, function (err, room) {
            if (err) {
                return callback(err);
            }

            var nick = session.getNick();

            this._withEachMembersMessageSink(room, function (messageSink) {
                messageSink.sendRoomMessage(roomName, nick, text);
            }.bind(this));

            return callback(null);
        }.bind(this));
    };

    return new RoomService();
});

