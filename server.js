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


// TODO: Clean up this mess!


requirejs([
    "underscore",
    "moment",
    "fs",
    "express",
    "http",
    "socket.io",
    "server/clientRegistry",
    "server/utils/parallel",
    "text!server/templates/index.html" ,

    "server/config",
    "server/utils/asset"
], function (
    _,
    moment,
    fs,
    express,
    http,
    io,
    clientRegistry,
    parallel,
    Template,

    config,
    asset
) {
    "use strict";

    // setup HTTP server

    var app = express();
    var httpServer = http.createServer(app);

    httpServer.listen(config.http.port, function () {
        console.log("Listening at: http://localhost:" + config.http.port);
    });

    // basic authentication to keep public out for now
    var auth = function (req, res, next) {
        next();
    };

    if (config.http.isBasicAuthEnabled) {
        auth = express.basicAuth(config.http.user, config.http.password);
    }

    app.use(auth);

    // asset management / static content

    if (config.isDevelopment) {
        app.use("/js", express.static(config.paths.client));
        app.use("/js", express.static(config.paths.shared));
    }

    app.use("/", express.static(config.paths.htdocs, {maxAge: 365 * 24 * 60 * 60 * 1000}));

    app.get("/", function (req, res, next) {
        var getTemplate = function (callback) {
            if (config.isDevelopment) {
                // always get current template in development
                fs.readFile(config.paths.root + "/server/templates/index.html", "utf8", callback);
            } else {
                callback(null, Template);
            }
        };

        parallel.parallel([
            asset.getAssetHashes,
            getTemplate
        ], function (err, hashes, template) {
            if (err) {
                return next(err);
            }

            res.writeHead(200, {
                "Content-type": "text/html",
                "Cache-Control": "no-cache",
                "Expires": moment(0).toDate().toUTCString() // immediately
            });
            res.end(_.template(template, {
                hashes: hashes,
                asset: function (filename) {
                    return filename + "?v=" + this.hashes[filename];
                }
            }));
        });
    });


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

