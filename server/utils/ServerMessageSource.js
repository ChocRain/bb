/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "underscore",
    "domain",
    "server/services/authenticationService",
    "server/services/roomService",
    "shared/utils/validator",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/ProtocolException",
    "shared/exceptions/ValidationException"
], function (
    _,
    domain,
    authenticationService,
    roomService,
    validator,
    FeedbackException,
    ProtocolException,
    ValidationException
) {
    "use strict";

    var ServerMessageSource = function (session, messageDispatcher, messageSink) {
        var disconnectHandler = function () {
            if (session.isLoggedIn()) {
                roomService.leaveAllRooms(session);
                authenticationService.logout(session);
            }
        };

        var messageHandlers = {
            "client.user.login": {
                loginNotNeeded: true,
                callback: function (payload) {
                    var assertion = payload.assertion;

                    authenticationService.login(session, assertion, function () {
                        messageSink.sendLoggedIn();
                    });
                }
            },

            "client.user.register": {
                loginNotNeeded: true,
                callback: function (payload) {
                    var nick = payload.nick;
                    var assertion = payload.assertion;

                    authenticationService.register(session, assertion, nick, function () {
                        messageSink.sendLoggedIn();
                    });
                }
            },

            "client.room.list": {
                callback: function () {
                    var roomNames = roomService.getRoomNames();

                    var rooms = _.map(roomNames, function (roomName) {
                        return {
                            name: roomName
                        };
                    });

                    messageSink.sendRoomList(rooms);
                }
            },

            "client.room.join": {
                callback: function (payload) {
                    roomService.join(session, payload.room);
                }
            },

            "client.room.message": {
                callback: function (payload) {
                    roomService.sendMessage(session, payload.room, payload.text);
                }
            }
        };

        var wrappedMessageHandlers = {};

        _.each(messageHandlers, function (handler, name) {
            var callback;

            var loginRequired = !handler.loginNotNeeded;
            if (loginRequired) {
                callback = function (payload) {
                    if (!session.isLoggedIn()) {
                        throw new ProtocolException(
                            "This message is only allowed for logged in users: " + name
                        );
                    }

                    handler.callback(payload);
                };
            } else {
                callback = handler.callback;
            }

            var validatingdCallback = function (payload) {
                validator.validate(name, payload);
                callback(payload);
            };

            wrappedMessageHandlers[name] = validatingdCallback;
        });

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

            if (err instanceof ValidationException) {
                messageSink.sendValidationError(
                    err.message,
                    err.getConstraintsName(),
                    err.getValidationResult()
                );
                return;
            }

            // unhandled errors shall be re-thrown
            throw err;
        });

        var socket = messageDispatcher.getSocket();
        socket.setDisconnectHandler(messageDomain.bind(disconnectHandler));
        socket.setMessageHandler(messageDomain.bind(messageDispatcher.handleMessage.bind(messageDispatcher)));

        messageDispatcher.setMessageHandlers(wrappedMessageHandlers);
    };

    return ServerMessageSource;
});

