/**
 * A loading animation.
 */
define([
    "underscore",
    "libs/spin-1.3.0-min"
], function (
    _,
    Spinner
) {
    "use strict";

    var defaultOpts = {
        lines: 11, // The number of lines to draw
        length: 8, // The length of each line
        width: 4, // The line thickness
        radius: 11, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: "#EE3F96", // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: "spinner", // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: "auto", // Top position relative to parent in px
        left: "auto" // Left position relative to parent in px
    };

    var doCreate = function (opts) {
        return new Spinner(opts).spin();
    };


    return {
        create: function () {
            return doCreate(_.clone(defaultOpts));
        },

        createSmall: function () {
            return doCreate(_.defaults({
                length: 2,
                width: 2,
                radius: 4
            }, defaultOpts));
        }
    };
});

