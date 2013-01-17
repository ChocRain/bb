/**
 * The main entrypoint for require.js, but only used for configuration.
 */
require.config({
    paths: {
        // Internal modules that will be wrapped. Do never use directly!
        "_socketio": "/socket.io/socket.io",
        "_underscore": "libs/underscore-amd-1.4.3-min"
    }
});

// wrapper modules for keeping the global namespace clean

define("backbone", ["_underscore", "libs/backbone-amd-0.9.10-min"], function () {
    "use strict";

    // this is dirty, but doesn't seem to work otherwise...
    // we enforce to always load backbone at least once to ensure
    // cleanup of the global namepsace also for jQuery
    window.jQuery.noConflict(true);

    return window.Backbone.noConflict(); // clear global namepsace
});

define("crafty", ["libs/crafty-0.5.3-min"], function () {
    "use strict";

    var Crafty = window.Crafty;
    window.Crafty = undefined; // clear global namespace

    return Crafty;
});

define("socketio", ["_socketio"], function () {
    "use strict";

    var io = window.io;
    window.io = undefined; // clear global namespace

    return io;
});

// depend on backbone to make sure it is loaded before and has _ in scope.
define("underscore", ["_underscore", "backbone"], function () {
    "use strict";

    return window._.noConflict(); // clear global namespace
});

// main entry point

require([
    "app",
    "backbone" // enforce loading at least once for dirty hack above
], function (
    App 
) {
    "use strict";

    new App(); // run the app
});

