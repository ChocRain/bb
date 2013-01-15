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

app.get("/", function(req, res) {
    res.writeHead(200, { "Content-type": "text/html"});
    res.end(fs.readFileSync(__dirname + "/htdocs/index.html"));
});

httpServer.listen(8080, function() {
    console.log("Listening at: http://localhost:8080");
});


// setup socket.io
 
socketio.listen(httpServer).on("connection", function (socket) {
    clientRegistry.register(socket);
});

