// require.js
var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,
    paths: {
        "text": "shared/libs/text-2.0.3"
    }
});

// encapsulate node.js specific stuff
requirejs.define("_nodejs", [
], function (
) {
    "use strict";

    return {
        rootDirectory: __dirname
    };
});

requirejs([
    "socket.io",

    "server/clientRegistry",
    "server/app"
], function (
    io,
    clientRegistry,
    app
) {
    "use strict";

    var httpApp = app.create();
    var httpServer = httpApp.getHttpServer();

    // TODO: Move to own module
    // setup socket.io

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
});

