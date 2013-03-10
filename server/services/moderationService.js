/**
 * Service for handling rooms.
 */
define([
    "underscore",
    "server/session/sessionStore",
    "server/services/authenticationService",
    "server/daos/userDao",
    "shared/models/roles",
    "json!shared/definitions/rules.json",
    "shared/exceptions/CommandException",
    "shared/exceptions/IllegalStateException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    sessionStore,
    authenticationService,
    userDao,
    roles,
    rules,
    CommandException,
    IllegalStateException,
    ProtocolException
) {
    "use strict";

    var ModerationService = function () {
    };

    ModerationService.prototype._ensureModerator = function (session, callback) {
        if (!(session.isLoggedIn() && session.getUser().getRole().getName() === roles.MODERATOR.getName())) {
            return callback(new ProtocolException("This action is only allowed for moderators."));
        }
        return callback(null);
    };

    ModerationService.prototype._logModAction = function (session, action) {
        action.moderator = session.getUser().getNick();
        console.log("[MOD]", action);
    };

    ModerationService.prototype._findRule = function (ruleName, callback) {
        var matchingRules = _.filter(rules.dos.concat(rules.donts), function (rule) {
            return rule.tag.toLowerCase() === ruleName.toLowerCase();
        });

        if (matchingRules.length > 1) {
            return callback(new IllegalStateException(
                "Found more than one rule: tag = " + ruleName + ", rules = " + matchingRules
            ));
        }

        if (matchingRules.length === 1) {
            return callback(null, matchingRules[0]);
        }

        return callback(null, null);
    };

    ModerationService.prototype.remindOfRule = function (session, ruleName, nick, callback) {
        this._ensureModerator(session, function (err) {
            if (err) {
                return callback(err);
            }

            this._findRule(ruleName, function (err, rule) {
                if (err) {
                    return callback(err);
                }

                if (!rule) {
                    return callback(new CommandException(
                        "Cannot remind user of rule. Rule doesn't exist: " + ruleName
                    ));
                }

                sessionStore.findByNick(nick, function (err, userSession) {
                    if (err) {
                        return callback(err);
                    }

                    if (!userSession) {
                        return callback(new CommandException(
                            "Cannot remind user of rule. User is gone or doesn't exist: " + nick
                        ));
                    }

                    var messageSink = userSession.get("messageSink");
                    if (!messageSink) {
                        return callback(new IllegalStateException(
                            "Couldn't get message sink from session."
                        ));
                    }

                    var remindedNick = userSession.getUser().getNick();

                    messageSink.sendRule(ruleName);
                    this._logModAction(session, {remindedOfRule: {rule: rule.tag, nick: remindedNick}});

                    callback(null, rule.tag, remindedNick);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    ModerationService.prototype.remindOfRules = function (session, nick, callback) {
        this._ensureModerator(session, function (err) {
            if (err) {
                return callback(err);
            }

            sessionStore.findByNick(nick, function (err, userSession) {
                if (err) {
                    return callback(err);
                }

                if (!userSession) {
                    return callback(new CommandException(
                        "Cannot remind user of rules. User is gone or doesn't exist: " + nick
                    ));
                }

                var messageSink = userSession.get("messageSink");
                if (!messageSink) {
                    return callback(new IllegalStateException(
                        "Couldn't get message sink from session."
                    ));
                }

                var remindedNick = userSession.getUser().getNick();

                messageSink.sendRules();
                this._logModAction(session, {remindedOfRules: remindedNick});

                callback(null, remindedNick);
            }.bind(this));
        }.bind(this));
    };

    ModerationService.prototype.kick = function (session, nick, callback) {
        this._ensureModerator(session, function (err) {
            if (err) {
                return callback(err);
            }

            sessionStore.findByNick(nick, function (err, userSession) {
                if (err) {
                    return callback(err);
                }

                if (!userSession) {
                    return callback(new CommandException(
                        "Cannot kick user. User is gone or doesn't exist: " + nick
                    ));
                }

                var messageSink = userSession.get("messageSink");
                if (!messageSink) {
                    return callback(new IllegalStateException(
                        "Couldn't get message sink from session."
                    ));
                }

                var kickedNick = userSession.getUser().getNick();
                messageSink.sendKicked(kickedNick);

                authenticationService.logout(userSession, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    this._logModAction(session, {kicked: kickedNick});
                    return callback(null, kickedNick);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    ModerationService.prototype.ban = function (session, nick, callback) {
        this._ensureModerator(session, function (err) {
            if (err) {
                return callback(err);
            }

            userDao.updateBanned(nick, true, function (err, user) {
                if (err) {
                    return callback(err);
                }

                if (!user) {
                    return callback(new CommandException("Cannot ban user. No such user: " + nick));
                }

                var bannedNick = user.getNick();

                this._logModAction(session, {banned: bannedNick});

                sessionStore.findByNick(nick, function (err, userSession) {
                    if (err) {
                        return callback(err);
                    }

                    if (!userSession) {
                        return callback(null, bannedNick); // no user to logout
                    }

                    var messageSink = userSession.get("messageSink");
                    if (!messageSink) {
                        return callback(new IllegalStateException(
                            "Couldn't get message sink from session."
                        ));
                    }

                    messageSink.sendBanned(bannedNick);

                    authenticationService.logout(userSession, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        return callback(null, bannedNick);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    ModerationService.prototype.unban = function (session, nick, callback) {
        this._ensureModerator(session, function (err) {
            if (err) {
                return callback(err);
            }

            userDao.updateBanned(nick, false, function (err, user) {
                if (err) {
                    return callback(err);
                }

                if (!user) {
                    return callback(new CommandException("Cannot unban user. No such user: " + nick));
                }

                var unbannedNick = user.getNick();

                this._logModAction(session, {unbanned: unbannedNick});

                callback(null, unbannedNick);
            }.bind(this));
        }.bind(this));
    };

    return new ModerationService();
});

