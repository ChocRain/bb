/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "routes/rootNavigator",
    "models/userSession",
    "utils/clientMessageDispatcher",
    "collections/chatLogCollection"
], function (
    rootNavigator,
    userSession,
    messageDispatcher,
    chatLogCollection
) {
    "use strict";

    var handlers = {
        connected: function () {
            // TODO: Handle somehow?
            console.log("Connected...");
        },

        disconnected: function () {
            /*global alert: true */ // TODO: Nicer handling.
            alert("Connection lost...");
            rootNavigator.root().reload();
        },

        messageHandlers: {
            "server.user.loggedin": function (payload) {
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

    messageDispatcher.initHandlers(handlers);

    return {}; // nothing to expose, require only for binding
});

