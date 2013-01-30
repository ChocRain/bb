/**
 * Server for socekt.io connections.
 */
define([
    "socket.io",
    "server/clientRegistry",
], function (
    io,
    clientRegistry
) {
    "use strict";

    var SocketServer = function (httpServer) {
        var serverSocket = io.listen(httpServer);

        serverSocket.on("connection", function (socket) {
            clientRegistry.register(socket);
        });

        serverSocket.configure("production", function () {
            serverSocket.enable("browser client minification");
            serverSocket.enable("browser client gzip");
            serverSocket.enable("browser client etag");
            serverSocket.set("log level", 1);
            serverSocket.set("transports", ["htmlfile", "xhr-polling", "jsonp-polling"]);
        });

        serverSocket.configure("development", function () {
            serverSocket.enable("browser client gzip");
            serverSocket.enable("browser client etag");
            serverSocket.set("transports", ["websocket"]);
        });
    };

    return {
        create: function (httpServer) {
            return new SocketServer(httpServer);
        }
    };
});

