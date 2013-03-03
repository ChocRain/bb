/**
 * The main entrypoint for the server application.
 */

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
    "server/utils/db",
    "server/httpApp",
    "server/socketServer",
    "server/utils/dbMigrator"
], function (
    db,
    httpApp,
    socketServer,
    dbMigrator
) {
    "use strict";

    // database
    db.init(function (err) {
        if (err) {
            throw err;
        }

        dbMigrator.migrate(function (err) {
            if (err) {
                throw err;
            }

            // db may now be used

            // http
            var app = httpApp.create();
            var httpServer = app.getHttpServer();

            // socket.io
            socketServer.create(httpServer);
        });
    });
});

