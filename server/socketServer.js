/**
 * Server for socekt.io connections.
 */
define([
    "socket.io",
    "server/session/sessionStore",
    "server/utils/ServerMessageDispatcher",
    "server/utils/ServerMessageSink",
    "server/utils/ServerMessageSource",
    "server/utils/Socket"
], function (
    io,
    sessionStore,
    MessageDispatcher,
    MessageSink,
    MessageSource,
    Socket
) {
    "use strict";

    var SocketServer = function (httpServer) {
        var serverSocket = io.listen(httpServer);

        serverSocket.on("connection", function (connectedSocket) {
            var session = sessionStore.newSession();
            var socket = new Socket(connectedSocket);

            var messageDispatcher = new MessageDispatcher(session, socket);
            var messageSink = new MessageSink(messageDispatcher);
            var messageSource = new MessageSource(session, messageDispatcher, messageSink);

            session.set({
                messageSource: messageSource,
                messageSink: messageSink
            });

            messageSink.sendSessionInitialized(session.getId());
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

