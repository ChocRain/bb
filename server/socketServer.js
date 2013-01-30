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
        var socket = io.listen(httpServer);

        socket.on("connection", function (socket) {
            clientRegistry.register(socket);
        });

        socket.configure("production", function () {
            socket.enable("browser client minification");
            socket.enable("browser client gzip");
            socket.enable("browser client etag");
            socket.set("log level", 1);
            socket.set("transports", ["htmlfile", "xhr-polling", "jsonp-polling"]);
        });

        socket.configure("development", function () {
            socket.set("transports", ["websocket"]);
        });
    };

    return {
        create: function (httpServer) {
            return new SocketServer(httpServer);
        }
    };
});

