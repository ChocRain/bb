/**
 * Service for handling rooms.
 */
define([
    "underscore",
    "server/session/sessionStore",
    "server/services/authenticationService",
    "server/daos/userDao",
    "shared/models/roles",
    "shared/exceptions/CommandException",
    "shared/exceptions/IllegalStateException",
    "shared/exceptions/ProtocolException"
], function (
    _,
    sessionStore,
    authenticationService,
    userDao,
    roles,
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

    ModerationService.prototype.kick = function (session, nick, callback) {
        this._ensureModerator(session, function (err) {
            if (err) {
                return callback(err);
            }

            var userSession = sessionStore.findByNick(nick);
            if (!userSession) {
                return callback(new CommandException("Cannot kick user. User is gone or doesn't exist: " + nick));
            }

            var messageSink = userSession.get("messageSink");
            if (!messageSink) {
                throw new IllegalStateException("Couldn't get message sink from session.");
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

                var userSession = sessionStore.findByNick(nick);
                if (!userSession) {
                    return callback(null, bannedNick); // no user to logout
                }

                var messageSink = userSession.get("messageSink");
                if (!messageSink) {
                    throw new IllegalStateException("Couldn't get message sink from session.");
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

