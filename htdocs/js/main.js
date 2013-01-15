/**
 * The main entrypoint for require.js, but only used for configuration.
 */
requirejs.config({
    shim: {
        "crafty": {
            exports: "Crafty"
        },
        "socket.io": {
            exports: "io"
        },
        "underscore": {
            exports: "_"
        }
    },
    paths: {
        "crafty": "/js/libs/crafty-min",
        "underscore": "/js/libs/underscore-min",
        "socket.io": "/socket.io/socket.io.js" // delivered by the server
    }
});
  
require([
    "app" 
], function (
    App 
) {
    "use strict";

    new App(); // run the app
});

