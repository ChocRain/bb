/**
 * The main entrypoint for require.js, but only used for configuration.
 */
require.config({
    paths: {
        "_socketio": "/socket.io/socket.io" // do never use directly
    }
});

// wrapper modules for keeping the global namespace clean

define("crafty", ["libs/crafty-0.5.3-min"], function () {
    "use strict";

    var Crafty = window.Crafty;
    window.Crafty = undefined; // clear global namespace

    return Crafty;
});

define("jquery", ["libs/jquery-1.9.0.min"], function () {
    "use strict";

    return window.jQuery.noConflict(true); // clear global namepsace
});

define("socketio", ["_socketio"], function () {
    "use strict";

    var io = window.io;
    window.io = undefined; // clear global namespace

    return io;
});

define("underscore", ["libs/underscore-amd-1.4.3-min"], function () {
    "use strict";

    return window._.noConflict(); // clear global namespace
});

// main entry point

require([
    "app" 
], function (
    App 
) {
    "use strict";

    new App(); // run the app
});

