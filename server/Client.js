// TODO: Refactor this

// library imports
var crypto = require("crypto");
var uuid = require("node-uuid");
var _ = require("underscore");

/**
 * Generates a session id to be used by the client to authenticate itself.
 * The session id is valid as long as the client is connected via socket.io.
 */
var generateSessionId = function () {
    // random secret to base the session id on
    // in this case we use a random uuid
    var randomSecret = uuid.v4();

    // to ensure we always get a new session id we append the current timestamp
    // in millis (a little paranoid about the uuid I guess...)
    randomSecret += new Date().getTime();

    // generate the SHA1 hash of the random secret
    var sha1sum = crypto.createHash("sha1");
    sha1sum.update(randomSecret);
    var hash = sha1sum.digest("hex");

    // the hash serves as our session id
    return hash;
};

/**
 * A representation of a single client.
 */
var Client = function (id, socket, registry) {
    this._id = id;
    this._socket = socket;
    this._registry = registry;

    // session
    this._sessionId = null;
    this._sessionData = null;

    console.log("We have a new client:", this._id);

    var clientMessageHandlers = {
        "client.user.enter": {
            allowWithoutSession: true, // TODO: Only login later on

            // TODO: Add message validation constraints
            // constraints: { ... }

            callback: function (payload) {
                var nick = payload.nick;
                console.log("User tries to enter:", nick);

                // TODO: User handling

                this._newSession();
                this._putIntoSession("nick", nick); // hold user instead?

                this._registry.broadcast("server.user.entered", {
                    nick: nick
                });
            }.bind(this)
        },

        "client.chat.message": {
            // TODO: Add message validation constraints
            // constraints: { ... }

            callback: function (payload) {
                this._registry.broadcast("server.chat.message", {
                    nick: this._getFromSession("nick"),
                    text: payload.text
                });
            }.bind(this)
        }
    };

    var handleMessageError = function (error, message) {
        console.error(error, message);

        this._invalidateSession();
        this.send("server.error", {
            errorMessage: error
        });

        // TODO: Find a nicer way to handle this.
        // Dirty hack to trigger disconnect after the error has been
        // reported to the client.
        setTimeout(
            function () {
                this._socket.disconnect();
            }.bind(this),
            1000 // 1s
        );
    }.bind(this);

    this._socket.on("message", function (messageStr) {
        var message = JSON.parse(messageStr);

        if (!message) {
            handleMessageError("Empty message.", message);
            return;
        }

        if (!message.type) {
            handleMessageError("No message type.", message);
            return;
        }

        var handler = clientMessageHandlers[message.type];

        if (!handler) {
            handleMessageError("Unknown message type.", message);
            return;
        }

        // check we have the correct session id
        if (!handler.allowWithoutSession && !this._isValidSessionId(message.sessionId)) {
            handleMessageError("Invalid session.", message);
            return;
        }

        // TODO: Validate payload via constraints
        console.log("Hanling message:", message.type);
        handler.callback.call(this, message.payload);
    }.bind(this));

    this._socket.on("disconnect", function () {
        console.log("Client disconnected:", this._id);

        this._invalidateSession();
        this._registry.unregister(this);
    }.bind(this));
};

Client.prototype.getId = function () {
    return this._id;
};

Client.prototype.send = function (type, payload) {
    var message = {
        type: type,
        payload: payload
    };

    if (this._hasSession()) {
        message.sessionId = this._sessionId;
    }

    this._socket.emit(
        "message",
        JSON.stringify(message)
    );
};

// session handling
// TODO: Refactor

Client.prototype._hasSession = function () {
    return _.isString(this._sessionId) && this._sessionId !== "";
};

Client.prototype._isValidSessionId = function (sessionId) {
    if (!this._hasSession()) {
        // there is no valid session id
        return false;
    }
    return this._sessionId === sessionId;
};

Client.prototype._newSession = function () {
    this._sessionId = generateSessionId();
    this._sessionData = {};
};

Client.prototype._invalidateSession = function () {
    this._sessionId = null;
    this._sessionData = null;
};

Client.prototype._putIntoSession = function (key, value) {
    if (!_.isObject(this._sessionData)) {
        // TODO: Think about exception handling
        throw new Error("No session to put into.");
    }
    this._sessionData[key] = value;
};

Client.prototype._getFromSession = function (key) {
    if (!_.isObject(this._sessionData)) {
        // TODO: Think about exception handling
        throw new Error("No session to get from.");
    }
    return this._sessionData[key];
};

// exports
module.exports = Client;

