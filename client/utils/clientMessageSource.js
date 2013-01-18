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

        disconnected: function() {
            // TODO: Nicer handling.
            alert("Connection lost...");
            window.location = "/";
        },

        messageHandlers: {
            "server.user.loggedin": function (payload) {
                userSession.setLoggedIn(true);
                rootNavigator.root().go();
            },

            "server.user.entered": function (payload) {
                chatLogCollection.add({
                    type: "entered",
                    nick: payload.nick
                });
            },

            "server.user.left": function (payload) {
                chatLogCollection.add({
                    type: "left",
                    nick: payload.nick
                });
            },

            "server.chat.message": function (payload) {
                chatLogCollection.add({
                    type: "message",
                    nick: payload.nick,
                    text: payload.text
                });
            }
        }
    };

    messageDispatcher.initHandlers(handlers);

    return {}; // nothing to expose, require only for binding
});

