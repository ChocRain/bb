// Config
var port = process.env.PORT || 8080;
var user = process.env.BASIC_AUTH_USER || null;
var password = process.env.BASIC_AUTH_PASSWORD || null;

// require.js
var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require,
    paths: {
        "text": "shared/libs/text-2.0.3"
    }
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
    "glob",
    "server/utils/parallel",
    "text!server/templates/index.html",
    "server/utils/crypto"
], function (
    _,
    moment,
    fs,
    express,
    http,
    io,
    clientRegistry,
    glob,
    parallel,
    Template,
    crypto
) {
    "use strict";

    // we enable some optimizations for production

    var isProduction = process.env.NODE_ENV === "production";

    // setup HTTP server

    var app = express();
    var httpServer = http.createServer(app);

    httpServer.listen(port, function () {
        console.log("Listening at: http://localhost:" + port);
    });

    // basic authentication to keep public out for now
    var auth = function (req, res, next) {
        next();
    };

    if (user && password) {
        auth = express.basicAuth(user, password);
    }

    app.use(auth);

    // asset management / static content

    var htdocsPath = __dirname + "/htdocs";

    if (!isProduction) {
        app.use("/js", express.static(__dirname + "/client"));
        app.use("/js", express.static(__dirname + "/shared"));
    }

    app.use("/", express.static(htdocsPath, {maxAge: 365 * 24 * 60 * 60 * 1000}));

    app.get("/", function (req, res, next) {
        var getAssetHashes = function (callback) {
            // TODO: Cache for production
            // TODO: Include /shared and /client for development
            glob(htdocsPath + "/**/*", function (err, paths) {
                if (err) {
                    return callback(err);
                }

                parallel.filter(
                    paths,
                    function (path, predicateCallback) {
                        fs.stat(path, function (err, stats) {
                            if (err) {
                                return predicateCallback(err);
                            }

                            predicateCallback(null, stats.isFile());
                        });
                    },
                    function (err, filenames) {
                        if (err) {
                            return callback(err);
                        }

                        parallel.map(
                            filenames,
                            function (filename, transformerCallback) {
                                crypto.md5FileSum(filename, function (err, sum) {
                                    if (err) {
                                        return transformerCallback(err);
                                    }

                                    var result = {};
                                    result[filename.substr(htdocsPath.length)] = sum;

                                    transformerCallback(null, result);
                                });
                            },
                            function (err, hashes) {
                                if (err) {
                                    return callback(err);
                                }

                                callback(null, _.defaults.apply(_, hashes));
                            }
                        );
                    }
                );
            });
        };

        var getTemplate = function (callback) {
            if (!isProduction) {
                // always get current template in development
                fs.readFile(__dirname + "/server/templates/index.html", "utf8", callback);
            } else {
                callback(null, Template);
            }
        };

        parallel.parallel([
            getAssetHashes,
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

