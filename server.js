// require.js
var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,
    paths: {
        "json": "shared/libs/json-0.3.0",
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
    "server/httpApp",
    "server/socketServer"
], function (
    httpApp,
    socketServer
) {
    "use strict";

    // http
    var app = httpApp.create();
    var httpServer = app.getHttpServer();

    // socket.io
    socketServer.create(httpServer);
});

