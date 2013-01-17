// Config
var port = process.env.PORT || 8080;
var user = process.env.BASIC_AUTH_USER || null;
var password = process.env.BASIC_AUTH_PASSWORD || null;

// library imports

var fs = require("fs");
var express = require('express');
var http = require("http")
var socketio = require("socket.io");

// own imports
var clientRegistry = require("./server/clientRegistry.js");


// setup HTTP server

var app = express(); 
var httpServer = http.createServer(app);

httpServer.listen(port, function() {
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
}
app.use("/", express.static(__dirname + "/htdocs"));

app.get("/", function(req, res) {
    fs.readFile(__dirname + "/htdocs/index.html", "utf8", function (err, body) {
        if (err) return next(err);

        res.writeHead(200, { "Content-type": "text/html"});
        res.end(body);
    });
});


// setup socket.io
 
socketio.listen(httpServer).on("connection", function (socket) {
    clientRegistry.register(socket);
});

