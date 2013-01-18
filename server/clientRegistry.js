/**
 * Registry for all connected clients.
 */
define([
    "underscore",
    "server/Client"
],
function (
    _,
    Client
) {
    "use strict";

    var ClientRegistry = function () {
        this._connectedClients = {};
        this._lastId = 0;
    };

    ClientRegistry.prototype._newClientId = function () {
        this._lastId += 1;
        return this._lastId;
    };

    ClientRegistry.prototype.register = function (socket) {
        console.log("Registering new client.");

        var clientId = this._newClientId();
        this._connectedClients[clientId] = new Client(clientId, socket, this);

        console.log("Current number of clients:", _.size(this._connectedClients));
    };

    ClientRegistry.prototype.unregister = function (client) {
        var clientId = client.getId();

        console.log("Unregistering client:", clientId);

        delete this._connectedClients[clientId];

        console.log("Number of remaining clients:", _.size(this._connectedClients));
    };

    /**
     * Broadcasts a message to all connected clients.
     */
    ClientRegistry.prototype.broadcast = function (type, payload) {
        _.each(this._connectedClients, function (client) {
            client.send(type, payload);
        }, this);
    }

    return new ClientRegistry();
});

