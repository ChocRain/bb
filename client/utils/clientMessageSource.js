/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "jquery",
    "routes/rootNavigator",
    "models/userSession",
    "shared/models/PublicUser",
    "shared/models/RoomMember",
    "utils/clientMessageDispatcher",
    "utils/clientMessageSink",
    "collections/chatLogCollection",
    "collections/chatRoomMembersCollection",
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
    RoomMember,
    messageDispatcher,
    messageSink,
    chatLogCollection,
    chatRoomMembersCollection,
    ChatView,
    dialog,
    roomScene,
    IllegalArgumentException,
    IllegalStateException
) {
    "use strict";

    var getMemberModelByNick = function (nick) {
        var memberModel = chatRoomMembersCollection.get(nick);

        if (!memberModel) {
            throw new IllegalStateException(
                "Don't have a member in the collection for that nick: " + nick
            );
        }

        return memberModel;
    };

    var getMemberByNick = function (nick) {
        var memberModel = getMemberModelByNick(nick);
        return RoomMember.fromJSON(memberModel.attributes);
    };

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

                "server.moderation.remindedOfRules": function (payload) {
                    chatLogCollection.add({
                        type: "system-out",
                        lines: payload.nick + " has been reminded of the rules."
                    });
                },

                "server.moderation.rules": function () {
                    return dialog.showMessage(
                        "A moderator wants to remind you of the rules",
                        "You seem to have broken one or more of the rules. Please read those again before continuing.",
                        "Show rules in new window",
                        function () {
                            rootNavigator.rules().openInNewWindow();
                        }
                    );
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
                            "Please reconsider your behavior. For further information have a look at the rules.",
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
                    chatRoomMembersCollection.add(payload.member);
                    chatLogCollection.add({
                        type: "entered",
                        date: date,
                        room: payload.room,
                        user: PublicUser.fromJSON(payload.member.user)
                    });

                    if (payload.member.user.nick === userSession.getUser().getNick()) {
                        // current user has joined a room, thus run the room
                        // scene and attach the ChatView.
                        roomScene.run(payload.room);
                        $("#ui").html(new ChatView({model: userSession}).render().el);
                    }
                },

                "server.room.left": function (payload, date) {
                    // TODO: Proper room handling.
                    var member = getMemberByNick(payload.nick);
                    chatRoomMembersCollection.remove({nick: payload.nick});
                    chatLogCollection.add({
                        type: "left",
                        date: date,
                        room: payload.room,
                        user: member.getUser()
                    });
                },

                "server.room.info": function (payload, date) {
                    // TODO: Proper room handling.
                    chatRoomMembersCollection.reset(payload.members);
                },

                "server.room.message": function (payload, date) {
                    var member = getMemberByNick(payload.nick);
                    chatLogCollection.add({
                        type: "message",
                        date: date,
                        room: payload.room,
                        user: member.getUser(),
                        text: payload.text
                    });
                },

                "server.room.moved": function (payload, date) {
                    var memberModel = getMemberModelByNick(payload.nick);
                    memberModel.setPosition(payload.position);
                }
            }
        };

        messageDispatcher.initSocket(handlers);
    };

    return {
        init: init
    };
});

