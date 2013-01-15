/**
 * A representation of a single client.
 */
var Client = function (id, socket, registry) {
    this._id = id;
    this._socket = socket;
    this._registry = registry;

    console.log("We have a new client:", this._id);

    var clientMessageHandlers = {
        "client.chat.message": {
            // TODO: Add message validation constraints
            // constraints: { ... }

            callback: function (payload) {
                this._registry.broadcast("server.chat.message", {
                    nick: "Pinkie_Pie" + this._id,
                    text: payload.text
                });
            }.bind(this)
        }
    };

    this._socket.on("message", function (messageStr) {
        var message = JSON.parse(messageStr);
        if (!message || !message.type) {
            // TODO: Handle error
            console.error("Unknown type:", message);
            return;
        }

        var handler = clientMessageHandlers[message.type];

        if (!handler) {
            // TODO: Handle error
            console.error("No handler:", message);
            return;
        }

        // TODO: Validate payload via constraints
        handler.callback.call(this, message.payload);
    }.bind(this));

    this._socket.on("disconnect", function () {
        console.log("Client disconnected:", this._id);

        this._registry.unregister(this);
    }.bind(this));
};

Client.prototype.getId = function () {
    return this.id;
};

Client.prototype.send = function (type, payload) {
    this._socket.emit(
        "message",
        JSON.stringify({
            type: type,
            payload: payload
        })
    );
};

// exports

module.exports = Client;

