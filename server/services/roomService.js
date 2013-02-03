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

    RoomService.prototype.getRoomNames = function () {
        return _.keys(this._rooms);
    };

    RoomService.prototype.getByName = function (roomName) {
        var room = this._rooms[roomName];

        if (!room) {
            throw new FeedbackException("No such room: " + roomName);
        }

        if (!(room instanceof Room)) {
            throw new IllegalStateException("A room must be instance of Room: " + roomName);
        }

        return room;
    };

    RoomService.prototype.findByNick = function (nick) {
        // FIXME: This a really poor implementation in terms of performance.
        // O(n * m) with n being number of rooms and m the numbers of users.
        var rooms = _.filter(this._rooms, function (room) {
            return room.isMember(nick);
        });

        return rooms;
    };

    RoomService.prototype._withEachMembersMessageSink = function (room, callback) {
        var members = room.getMembers();
        var nicks = members; // currently a room only holds the nicks of the members

        _.each(sessionStore.findByNicks(nicks), function (memberSession) {
            var messageSink = memberSession.getMessageSink();
            callback(messageSink);
        });
    };

    RoomService.prototype.join = function (session, roomName) {
        if (!_.isString(roomName)) {
            throw new IllegalArgumentException("Room name must be a string: " + roomName);
        }

        var room = this.getByName(roomName);
        var nick = session.getNick();

        if (room.isMember(nick)) {
            throw new FeedbackException("You are already in that room: " + roomName);
        }

        room.join(nick);

        this._withEachMembersMessageSink(room, function (messageSink) {
            messageSink.sendUserJoinedRoom(roomName, nick);
        });
    };

    RoomService.prototype.leaveAllRooms = function (session) {
        var nick = session.getNick();

        _.each(this.findByNick(nick), function (room) {
            room.leave(nick);

            var roomName = room.getName();

            this._withEachMembersMessageSink(room, function (messageSink) {
                messageSink.sendUserLeftRoom(roomName, nick);
            });
        }, this);
    };

    RoomService.prototype.sendMessage = function (session, roomName, text) {
        var nick = session.getNick();
        var room = this.getByName(roomName);

        this._withEachMembersMessageSink(room, function (messageSink) {
            messageSink.sendRoomMessage(roomName, nick, text);
        });
    };

    return new RoomService();
});

