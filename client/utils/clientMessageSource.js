/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "jquery",
    "routes/rootNavigator",
    "models/userSession",
    "utils/clientMessageDispatcher"
], function (
    $,
    rootNavigator,
    userSession,
    messageDispatcher
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
                // TODO: Proper handling
                var li = $("<li></li>");
                var nick = payload.nick;
                li.append($("<span class=\"nick\"></span>").text("[" + nick + "]"));
                li.append($("<span class=\"action\"></span>").text("Entered the chat..."));
                $("#incomingChatMessages").append(li);
            },

            "server.chat.message": function (payload) {
                // TODO: Proper handling
                var nick = payload.nick;
                var text = payload.text;

                var li = $("<li></li>");
                li.append($("<span class=\"nick\"></span>").text("[" + nick + "]"));
                li.append($("<span class=\"text\"></span>").text(text));
                $("#incomingChatMessages").append(li);
            }
        }
    };

    messageDispatcher.initHandlers(handlers);

    return {}; // nothing to expose, require only for binding
});

