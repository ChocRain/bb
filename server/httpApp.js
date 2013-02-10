/**
 * Main entrance point for the HTTP server / app.
 */
define([
    "underscore",
    "moment",

    "http",
    "express",
    "fs",

    "server/config",
    "text!server/templates/index.html",
    "server/utils/parallel",
    "server/utils/asset"
], function (
    _,
    moment,

    http,
    express,
    fs,

    config,
    Template,
    parallel,
    asset
) {
    "use strict";

    var App = function () {
        // setup HTTP server

        var app = express();
        this._httpServer = http.createServer(app);

        this._httpServer.listen(config.http.port, function () {
            console.log("Listening on port:", config.http.port);
            console.log("Public URL is:", config.http.publicBaseUrl);
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
            app.use("/js/shared", express.static(config.paths.shared));
        }

        app.use("/", express.static(config.paths.htdocs, {maxAge: 365 * 24 * 60 * 60 * 1000}));

        app.get("/", function (req, res, next) {
            var getTemplate = function (callback) {
                if (config.isDevelopment) {
                    // always get current template in development
                    fs.readFile(config.paths.root + "/server/templates/index.html", "utf8", callback);
                } else {
                    return callback(null, Template);
                }
            };

            parallel.parallel([
                asset.getAssets,
                getTemplate
            ], function (err, assets, template) {
                if (err) {
                    return next(err);
                }

                res.writeHead(200, {
                    "Content-type": "text/html",
                    "Cache-Control": "no-cache",
                    "Expires": moment(0).toDate().toUTCString() // immediately
                });
                res.end(_.template(template, {
                    hashes: assets.hashes,
                    asset: assets.asset
                }));
            });
        });
    };

    App.prototype.getHttpServer = function () {
        return this._httpServer;
    };

    var appSingleton = null;

    return {
        create: function () {
            if (!appSingleton) {
                appSingleton = new App();
            }

            return appSingleton;
        }
    };
});

