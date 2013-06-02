/**
 * The main entrypoint for require.js, but only used for configuration.
 */
/*global window: true */ // for cleaning up the namespace only
require.config({
    baseUrl: "/js",

    paths: {
        // require.js plugins
        "json": "shared/libs/json-0.3.1",
        "text": "shared/libs/text-2.0.6",

        // Internal modules that will be wrapped. Do never use directly!
        "_socketio": "/socket.io/socket.io",
        "_underscore": "libs/underscore-amd-1.4.3-min"
    }
});

// wrapper modules for keeping the global namespace clean

define("backbone", ["_underscore", "libs/backbone-amd-0.9.10-min", "libs/jquery.caret.1.02.min"], function () {
    "use strict";

    // this is dirty, but doesn't seem to work otherwise...
    // we enforce to always load backbone at least once to ensure
    // cleanup of the global namepsace also for jQuery
    //
    // also loading jquery.caret here is a dirty hack too, but I somehow
    // cannot get that module loading right otherwise
    window.jQuery.noConflict(true);

    return window.Backbone.noConflict(); // clear global namepsace
});

define("crafty", ["libs/crafty-0.5.3-min"], function () {
    "use strict";

    var Crafty = window.Crafty;
    window.Crafty = undefined; // clear global namespace

    return Crafty;
});

define("moment", ["libs/moment-1.7.2-min"], function () {
    "use strict";

    var moment = window.moment;
    window.moment = undefined; // clear global namespace

    return moment;
});

define("socketio", ["_socketio"], function () {
    "use strict";

    var io = window.io;
    window.io = undefined; // clear global namespace

    return io;
});

define("underscore", ["_underscore"], function () {
    "use strict";

    var _ = window._;

    require(["backbone"], function () {
        // backbone needs to be initialized before cleaning up global namespace
        window._.noConflict();
    });

    return _;
});

// main entry point

require(["app"], function (App) {
    "use strict";

    var app = new App(); // run the app
});

