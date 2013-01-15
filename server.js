// library imports

var fs = require("fs");
var http = require("http")
var socketio = require("socket.io");

// own imports
var clientRegistry = require("./server/clientRegistry.js");


// setup HTTP server
 
var httpServer = http.createServer(function(req, res) {
    res.writeHead(200, { "Content-type": "text/html"});
    res.end(fs.readFileSync(__dirname + "/htdocs/index.html"));
}).listen(8080, function() {
    console.log("Listening at: http://localhost:8080");
});


// setup socket.io
 
socketio.listen(httpServer).on("connection", function (socket) {
    clientRegistry.register(socket);
});

