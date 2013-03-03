/**
 * Server for socekt.io connections.
 */
define([
    "domain",
    "socket.io",
    "server/session/sessionStore",
    "server/utils/ServerMessageDispatcher",
    "server/utils/ServerMessageSink",
    "server/utils/ServerMessageSource",
    "server/utils/socketFactory"
], function (
    domain,
    io,
    sessionStore,
    MessageDispatcher,
    MessageSink,
    MessageSource,
    socketFactory
) {
    "use strict";

    var SocketServer = function (httpServer) {
        var serverSocket = io.listen(httpServer);

        serverSocket.on("connection", function (connectedSocket) {
            var connectionDomain = domain.create();

            var handleError = function (err) {
                // make sure the server won't crash for errors in connectionDomain
                console.error("session:", err);
            };

            connectionDomain.on("error", handleError);

            connectionDomain.run(function () {
                var session = sessionStore.newSession(function (err, session) {
                    if (err) {
                        return handleError(err);
                    }

                    socketFactory.of(connectedSocket, function (err, socket) {
                        if (err) {
                            return handleError(err);
                        }

                        var messageDispatcher = new MessageDispatcher(session, socket);
                        var messageSink = new MessageSink(messageDispatcher);
                        var messageSource = new MessageSource(session, messageDispatcher, messageSink);

                        session.set({
                            socket: socket,
                            messageSource: messageSource,
                            messageSink: messageSink
                        });

                        messageSink.sendSessionInitialized(session.getId());
                    }.bind(this));
                }.bind(this));
            }.bind(this));
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

