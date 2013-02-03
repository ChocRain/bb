/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "domain",
    "server/services/authenticationService",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/ProtocolException"
], function (
    domain,
    authenticationService,
    FeedbackException,
    ProtocolException
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

        var messageDomain = domain.create();

        messageDomain.on("error", function (err) {
            if (err instanceof FeedbackException) {
                messageSink.sendFeedback(err.message);
                return;
            }

            if (err instanceof ProtocolException) {
                console.error("protocol exception:", err);
                messageSink.sendProtocolError(err.message);
                return;
            }

            // unhandled errors shall be re-thrown
            throw err;
        });

        var socket = messageDispatcher.getSocket();
        socket.setDisconnectHandler(messageDomain.bind(disconnectHandler));
        socket.setMessageHandler(messageDomain.bind(messageDispatcher.handleMessage.bind(messageDispatcher)));

        messageDispatcher.setMessageHandlers(messageHandlers);
    };

    return ServerMessageSource;
});

