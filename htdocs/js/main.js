/**
 * The main entrypoint for require.js, but only used for configuration.
 */

// wrapper modules for keeping the global namespace clean

define("crafty", ["/js/libs/crafty-0.5.3-min.js"], function () {
    "use strict";

    var Crafty = window.Crafty;
    window.Crafty = undefined; // clear global namespace

    return Crafty;
});

define("jquery", ["/js/libs/jquery-1.9.0.min.js"], function () {
    "use strict";

    return window.jQuery.noConflict(true); // clear global namepsace
});

define("socket.io", ["/socket.io/socket.io.js"], function () {
    "use strict";

    var io = window.io;
    window.io = undefined; // clear global namespace

    return io;
});

define("underscore", ["/js/libs/underscore-amd-1.4.3-min.js"], function () {
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

