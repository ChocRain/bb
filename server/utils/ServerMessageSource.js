/**
 * Source for messaging via a socket. Must be required once to initialize.
 */
define([
    "underscore",
    "domain",
    "server/services/authenticationService",
    "server/services/roomService",
    "server/services/moderationService",
    "shared/utils/validator",
    "shared/models/roles",
    "shared/exceptions/CommandException",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/ProtocolException",
    "shared/exceptions/ValidationException"
], function (
    _,
    domain,
    authenticationService,
    roomService,
    moderationService,
    validator,
    roles,
    CommandException,
    FeedbackException,
    ProtocolException,
    ValidationException
) {
    "use strict";

    var ServerMessageSource = function (session, messageDispatcher, messageSink) {
        var handleError = function (err) {
            if (!err) {
                return;
            }

            if (err instanceof FeedbackException) {
                messageSink.sendFeedback(err.message);
                return;
            }

            if (err instanceof ProtocolException) {
                console.error("protocol exception:", err);
                messageSink.sendProtocolError(err.message);
                return;
            }

            if (err instanceof CommandException) {
                messageSink.sendCommandError(err.message);
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
        };

        var disconnectHandler = function () {
            authenticationService.logout(session, handleError);
        };

        var messageHandlers = {
            "client.moderation.kick": {
                roles: [roles.MODERATOR],
                callback: function (payload) {
                    var nick = payload.nick;
                    moderationService.kick(session, nick, function (err, kickedNick) {
                        if (err) {
                            return handleError(err);
                        }

                        messageSink.sendKicked(kickedNick);
                    });
                }
            },

            "client.moderation.ban": {
                roles: [roles.MODERATOR],
                callback: function (payload) {
                    var nick = payload.nick;
                    moderationService.ban(session, nick, function (err, bannedNick) {
                        if (err) {
                            return handleError(err);
                        }

                        console.log("bannedNick:", bannedNick);

                        messageSink.sendBanned(bannedNick);
                    });
                }
            },

            "client.moderation.unban": {
                roles: [roles.MODERATOR],
                callback: function (payload) {
                    var nick = payload.nick;
                    moderationService.unban(session, nick, function (err, unbannedNick) {
                        if (err) {
                            return handleError(err);
                        }

                        messageSink.sendUnbanned(unbannedNick);
                    });
                }
            },

            "client.user.login": {
                loginNotNeeded: true,
                callback: function (payload) {
                    var assertion = payload.assertion;

                    authenticationService.login(session, assertion, function (err, user) {
                        if (err) {
                            return handleError(err);
                        }

                        messageSink.sendLoggedIn(user.toPublicUser());
                    });
                }
            },

            "client.user.register": {
                loginNotNeeded: true,
                callback: function (payload) {
                    var nick = payload.nick;
                    var assertion = payload.assertion;

                    authenticationService.register(session, assertion, nick, function (err, user) {
                        if (err) {
                            return handleError(err);
                        }
                        messageSink.sendLoggedIn(user.toPublicUser());
                    });
                }
            },

            "client.room.list": {
                roles: [roles.USER, roles.MODERATOR],
                callback: function () {
                    roomService.getRoomNames(function (err, roomNames) {
                        if (err) {
                            return handleError(err);
                        }

                        var rooms = _.map(roomNames, function (roomName) {
                            return {
                                name: roomName
                            };
                        });

                        messageSink.sendRoomList(rooms);
                    });
                }
            },

            "client.room.join": {
                roles: [roles.USER, roles.MODERATOR],
                callback: function (payload) {
                    roomService.join(session, payload.room, handleError);
                }
            },

            "client.room.message": {
                roles: [roles.USER, roles.MODERATOR],
                callback: function (payload) {
                    roomService.sendMessage(session, payload.room, payload.text, handleError);
                }
            },

            "client.room.move": {
                roles: [roles.USER, roles.MODERATOR],
                callback: function (payload) {
                    roomService.moveMember(session, payload.room, payload.position, handleError);
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
                        return handleError(new ProtocolException(
                            "This message is only allowed for logged in users: " + name
                        ));
                    }

                    var roleNames = _.map(handler.roles, function (role) {
                        return role.getName();
                    });

                    if (!_.contains(roleNames, session.getUser().getRole().getName())) {
                        return handleError(new ProtocolException(
                            "This message is forbidden for you: " + name
                        ));
                    }

                    handler.callback(payload);
                };
            } else {
                callback = handler.callback;
            }

            var validatingdCallback = function (payload) {
                validator.validate(name, payload);
                return callback(payload);
            };

            wrappedMessageHandlers[name] = validatingdCallback;
        });

        var messageDomain = domain.create();
        messageDomain.on("error", handleError);

        var socket = messageDispatcher.getSocket();
        socket.setDisconnectHandler(messageDomain.bind(disconnectHandler));
        socket.setMessageHandler(messageDomain.bind(messageDispatcher.handleMessage.bind(messageDispatcher)));

        messageDispatcher.setMessageHandlers(wrappedMessageHandlers);
    };

    return ServerMessageSource;
});

