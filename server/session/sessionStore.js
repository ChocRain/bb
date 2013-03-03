/**
 * An in-memory session store.
 */
define([
    "underscore",
    "moment",
    "node-uuid",
    "server/utils/crypto",
    "server/session/Session",
    "shared/exceptions/FeedbackException",
    "shared/exceptions/IllegalStateException"
], function (
    _,
    moment,
    uuid,
    crypto,
    Session,
    FeedbackException,
    IllegalStateException
) {
    "use strict";

    /**
     * The session store.
     */
    var SessionStore = function () {
        this._sessionsById = {};
    };

    /**
     * Generates a session id to be used by the client to authenticate itself.
     * The session id is valid as long as the client is connected via socket.io.
     */
    SessionStore.prototype._generateSessionId = function () {
        var i;

        for (i = 0; i < 10; i += 1) {
            // random secret to base the session id on
            // in this case we use a random uuid
            var randomSecret = uuid.v4();

            // to ensure we always get a new session id we append the current timestamp
            // in millis (a little paranoid about the uuid I guess...)
            randomSecret += moment().valueOf();

            // generate the SHA1 hash of the random secret
            var hash = crypto.sha1Sum(randomSecret);

            // the hash serves as our session id
            if (!this._sessionsById[hash]) {
                return hash;
            }
        }

        throw new FeedbackException("Unexpected error. Please try again.");
    };

    SessionStore.prototype.newSession = function () {
        var sessionId = this._generateSessionId();
        var session = new Session(sessionId, this);
        this._sessionsById[sessionId] = session;

        return session;
    };

    SessionStore.prototype.invalidate = function (sessionId) {
        var session = this._sessionsById[sessionId];
        if (session) {
            session.invalidate();
        }
    };

    SessionStore.prototype.remove = function (sessionId) {
        this._sessionsById[sessionId] = undefined;
    };

    SessionStore.prototype.findByNick = function (nick) {
        var sessions = this.findByNicks([nick]);

        if (sessions.length === 0) {
            return null;
        }

        if (sessions.length === 1) {
            return sessions[0];
        }

        throw new IllegalStateException("There is more than one session for this nick:", nick);
    };

    SessionStore.prototype.findByNicks = function (nicks) {
        var sessionsByLowerCaseNick = {};

        _.each(this._sessionsById, function (session) {
            if (!session) {
                return false;
            }

            var user = session.get("user");
            if (!user) {
                return false;
            }

            sessionsByLowerCaseNick[user.getNick().toLowerCase()] = session;
        });

        var sessions = [];

        _.each(nicks, function (nick) {
            var session = sessionsByLowerCaseNick[nick.toLowerCase()];

            if (session) {
                sessions.push(session);
            }
        });

        return sessions;
    };

    return new SessionStore();
});

