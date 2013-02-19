/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
/*global alert: true */ // TODO: Nicer feedback handling...
define([
    "jquery",
    "routes/rootNavigator",
    "models/userSession",
    "shared/models/PublicUser",
    "utils/clientMessageDispatcher",
    "utils/clientMessageSink",
    "collections/chatLogCollection",
    "collections/chatRoomUsersCollection",
    "views/DisconnectedView",
    "shared/exceptions/IllegalArgumentException"
], function (
    $,
    rootNavigator,
    userSession,
    PublicUser,
    messageDispatcher,
    messageSink,
    chatLogCollection,
    chatRoomUsersCollection,
    DisconnectedView,
    IllegalArgumentException
) {
    "use strict";

    var init = function (opts) {
        if (!opts || !opts.sessionInitialized) {
            throw new IllegalArgumentException("No callback for session initialization given!");
        }

        var _sessionAlreadyInitialized = false;

        var handlers = {
            connected: function () {
                // Nothin to see here, move along...
            },

            disconnected: function () {
                new DisconnectedView().show();
            },

            messageHandlers: {
                "server.error.feedback": function (payload) {
                    // TODO: Nicer feedback handling...
                    alert(payload.message);
                },

                "server.error.command": function (payload) {
                    chatLogCollection.add({
                        type: "system-error",
                        lines: payload.message
                    });
                },

                "server.error.protocol": function (payload) {
                    console.error("protocol error:", payload.message);
                },

                "server.error.validation": function (payload) {
                    // should not happen since validation already happens on the client
                    console.error("unexpected server validation error:", payload);
                },

                "server.moderation.kicked": function (payload) {
                    chatLogCollection.add({
                        type: "system-out",
                        lines: "You kicked: " + payload.nick
                    });
                },

                "server.moderation.banned": function (payload) {
                    chatLogCollection.add({
                        type: "system-out",
                        lines: "You banned: " + payload.nick
                    });
                },

                "server.moderation.unbanned": function (payload) {
                    chatLogCollection.add({
                        type: "system-out",
                        lines: "You unbanned: " + payload.nick
                    });
                },

                "server.session.initialized": function () {
                    if (_sessionAlreadyInitialized) {
                        console.warn("Session initialized already.");
                    } else {
                        _sessionAlreadyInitialized = true;
                        opts.sessionInitialized();
                    }
                },

                "server.session.loggedIn": function (payload) {
                    userSession.setLoggedIn(true);
                    userSession.setUser(PublicUser.fromJSON(payload.user));
                    rootNavigator.redirectAfterLogin();
                }.bind(this),

                "server.room.list": function (payload) {
                    // TODO: Proper room handling.
                    var room = payload.rooms[0];
                    messageSink.sendJoinRoom(room.name);
                },

                "server.room.joined": function (payload, date) {
                    chatRoomUsersCollection.add(payload.user);
                    chatLogCollection.add({
                        type: "entered",
                        date: date,
                        room: payload.room,
                        user: PublicUser.fromJSON(payload.user)
                    });
                },

                "server.room.left": function (payload, date) {
                    // TODO: Proper room handling.
                    chatRoomUsersCollection.remove({nick: payload.nick});
                    chatLogCollection.add({
                        type: "left",
                        date: date,
                        room: payload.room,
                        nick: payload.nick
                    });
                },

                "server.room.info": function (payload, date) {
                    // TODO: Proper room handling.
                    chatRoomUsersCollection.reset(payload.users);
                },

                "server.room.message": function (payload, date) {
                    chatLogCollection.add({
                        type: "message",
                        date: date,
                        room: payload.room,
                        nick: payload.nick,
                        text: payload.text
                    });
                }
            }
        };

        messageDispatcher.initSocket(handlers);
    };

    return {
        init: init
    };
});

