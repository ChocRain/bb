/**
 * An in-memory session store.
 */
define([
    "underscore",
    "moment",
    "node-uuid",
    "server/utils/crypto",
    "server/session/Session",
    "shared/exceptions/IllegalStateException"
], function (
    _,
    moment,
    uuid,
    crypto,
    Session,
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
        // random secret to base the session id on
        // in this case we use a random uuid
        var randomSecret = uuid.v4();

        // to ensure we always get a new session id we append the current timestamp
        // in millis (a little paranoid about the uuid I guess...)
        randomSecret += moment().valueOf();

        // generate the SHA1 hash of the random secret
        var hash = crypto.sha1Sum(randomSecret);

        // the hash serves as our session id
        return hash;
    };

    SessionStore.prototype.newSession = function () {
        var sessionId = this._generateSessionId();
        if (this._sessionsById[sessionId]) {
            // TODO: Graceful error handling
            throw new IllegalStateException(
                "The unlikely has happened: We generated a duplicate session id: " + sessionId
            );
        }

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
        // FIXME: This a really poor implementation in terms of performance.
        // O(n * m) with n being number of sessions and m being the number of nicks.
        var sessions = _.filter(this._sessionsById, function (session) {
            return session && _.contains(nicks, session.get("nick"));
        });

        return sessions;
    };

    return new SessionStore();
});

