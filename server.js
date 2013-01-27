// Config
var port = process.env.PORT || 8080;
var user = process.env.BASIC_AUTH_USER || null;
var password = process.env.BASIC_AUTH_PASSWORD || null;

// require.js
var requirejs = require("requirejs");

requirejs.config({
    nodeRequire: require
});


requirejs([
    "fs",
    "express",
    "http",
    "socket.io",
    "server/clientRegistry"
], function (
    fs,
    express,
    http,
    io,
    clientRegistry
) {
    "use strict";

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

    // static content
    if (process.env.NODE_ENV !== "production") {
        app.use("/js", express.static(__dirname + "/client"));
        app.use("/js", express.static(__dirname + "/shared"));
    }
    app.use("/", express.static(__dirname + "/htdocs", { maxAge: 60 * 1000 })); // 1 minute

    app.get("/", function (req, res, next) {
        fs.readFile(__dirname + "/htdocs/index.html", "utf8", function (err, body) {
            if (err) {
                return next(err);
            }

            res.writeHead(200, { "Content-type": "text/html"});
            res.end(body);
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

        console.log("p");
    });

    socket.configure("development", function () {
        console.log("d");
        socket.set("transports", ["websocket"]);
    });
});

