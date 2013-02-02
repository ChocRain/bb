/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "server/services/authenticationService"
], function (
    authenticationService
) {
    "use strict";

    var ServerMessageSource = function (session, messageDispatcher, messageSink) {
        var disconnectHandler = function () {
            // TODO: get rooms and send "left" notifications
            console.log("TODO: Handle disconnection...");
            authenticationService.logout(session);
        };

        var messageHandlers = {
            "client.user.login": function (payload) {
                var nick = payload.nick;
                console.log("User tries to enter:", nick);

                // TODO: validation

                authenticationService.login(session, nick);
                messageSink.sendLoggedIn();

                console.log("TODO: Enter a room...");
/*
                this._registry.broadcast("server.user.entered", {
                    nick: nick
                });
*/
            },

            "client.chat.message": function (payload) {
                console.log("TODO: Broadcast inside room...");

                // TODO: Add message validation constraints
                // constraints: { ... }

/*
                this._registry.broadcast("server.chat.message", {
                    nick: this._getFromSession("nick"),
                    text: payload.text
                });
*/
            }
        };

        var socket = messageDispatcher.getSocket();
        socket.setDisconnectHandler(disconnectHandler);
        socket.setMessageHandler(messageDispatcher.handleMessage.bind(messageDispatcher));

        messageDispatcher.setMessageHandlers(messageHandlers);
    };

    return ServerMessageSource;
});

