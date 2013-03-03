/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "jquery",
    "routes/rootNavigator",
    "models/userSession",
    "shared/models/PublicUser",
    "utils/clientMessageDispatcher",
    "utils/clientMessageSink",
    "collections/chatLogCollection",
    "collections/chatRoomUsersCollection",
    "views/ChatView",
    "utils/dialog",
    "scenes/roomScene",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException"
], function (
    $,
    rootNavigator,
    userSession,
    PublicUser,
    messageDispatcher,
    messageSink,
    chatLogCollection,
    chatRoomUsersCollection,
    ChatView,
    dialog,
    roomScene,
    IllegalArgumentException,
    IllegalStateException
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
                dialog.showMessage(
                    "Connection lost",
                    "The connection to the server has been closed. Would you like to reconnect?",
                    "Eeyup",
                    function () {
                        rootNavigator.reload();
                    }
                );
            },

            messageHandlers: {
                "server.error.feedback": function (payload) {
                    dialog.showMessage(
                        "Sorry",
                        payload.message,
                        "OK"
                    );
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
                    if (payload.nick === userSession.getUser().getNick()) {
                        return dialog.showMessage(
                            "You have been kicked",
                            "Please have a look at the rules before logging in again.",
                            "Show the rules",
                            function () {
                                rootNavigator.rules().reload();
                            }
                        );
                    }

                    chatLogCollection.add({
                        type: "system-out",
                        lines: payload.nick + " has been kicked."
                    });
                },

                "server.moderation.banned": function (payload) {
                    if (payload.nick === userSession.getUser().getNick()) {
                        return dialog.showMessage(
                            "You have been banned.",
                            "Please consider your behavior. For further information have a look at the rules.",
                            "Show the rules",
                            function () {
                                rootNavigator.rules().reload();
                            }
                        );
                    }

                    chatLogCollection.add({
                        type: "system-out",
                        lines: payload.nick + " has been banned."
                    });
                },

                "server.moderation.unbanned": function (payload) {
                    chatLogCollection.add({
                        type: "system-out",
                        lines: payload.nick + " has been unbanned."
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

                    if (payload.user.nick === userSession.getUser().getNick()) {
                        // current user has joined a room, thus run the room
                        // scene and attach the ChatView.
                        roomScene.run(payload.room);
                        $("#ui").html(new ChatView({model: userSession}).render().el);
                    }
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
                },

                "server.room.moved": function (payload, date) {
                    var userModel = chatRoomUsersCollection.get(payload.nick);
                    if (!userModel) {
                        throw new IllegalStateException(
                            "Don't have a user in the collection for that nick: " + payload.nick
                        );
                    }

                    userModel.setPosition(payload.position);
                }
            }
        };

        messageDispatcher.initSocket(handlers);
    };

    return {
        init: init
    };
});

