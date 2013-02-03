/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "jquery",
    "routes/rootNavigator",
    "models/userSession",
    "utils/clientMessageDispatcher",
    "collections/chatLogCollection",
    "views/DisconnectedView",
    "shared/exceptions/IllegalArgumentException"
], function (
    $,
    rootNavigator,
    userSession,
    messageDispatcher,
    chatLogCollection,
    DisconnectedView,
    IllegalArgumentException
) {
    "use strict";

    var init = function (opts) {
        if (!opts || !opts.sessionInitialized) {
            throw new IllegalArgumentException("No callback for session initialization given!");
        }

        var handlers = {
            connected: function () {
                // Nothin to see here, move along...
            },

            disconnected: function () {
                new DisconnectedView().show();
            },

            messageHandlers: {
                "server.session.initialized": opts.sessionInitialized,

                "server.session.loggedIn": function (payload) {
                    userSession.setLoggedIn(true);
                    rootNavigator.redirectAfterLogin();
                }.bind(this),

                "server.user.entered": function (payload, date) {
                    chatLogCollection.add({
                        type: "entered",
                        date: date,
                        nick: payload.nick
                    });
                },

                "server.user.left": function (payload, date) {
                    chatLogCollection.add({
                        type: "left",
                        date: date,
                        nick: payload.nick
                    });
                },

                "server.chat.message": function (payload, date) {
                    chatLogCollection.add({
                        type: "message",
                        date: date,
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

