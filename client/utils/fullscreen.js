/**
 * Util for going fullscreen.
 */
/*global document: true, Element: true*/
define([
    "jquery",
    "underscore",
    "hacks/craftyInput"
], function (
    $,
    _,
    craftyInput
) {
    "use strict";

    var body = $("body")[0];

    var reqFS = body.requestFullScreen || body.mozRequestFullScreen || body.webkitRequestFullScreen;
    var exitFS = document.exitFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen;

    var isFS = function () {
        return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    };

    var toggle = function () {
        if (isFS()) {
            exitFS.call(document);
        } else {
            reqFS.call(body, Element.ALLOW_KEYBOARD_INPUT);
        }
    };

    var isSupported = _.isFunction(reqFS) && _.isFunction(exitFS);

    return {
        toggle: isSupported ? toggle : function () {},
        isSupported: isSupported
    };
});

