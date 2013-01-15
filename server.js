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

httpServer.listen(8080, function() {
    console.log("Listening at: http://localhost:8080");
});

// basic authentication to keep public out for now
var auth = function (req, res, next) {
    next();
};

if (fs.existsSync("secret.json")) {
    var secret = JSON.parse(fs.readFileSync("secret.json"));
    auth = express.basicAuth(secret.user, secret.password);
}

// routes
app.get("/", auth, function(req, res) {
    res.writeHead(200, { "Content-type": "text/html"});
    res.end(fs.readFileSync(__dirname + "/htdocs/index.html"));
});


// setup socket.io
 
socketio.listen(httpServer).on("connection", function (socket) {
    clientRegistry.register(socket);
});

