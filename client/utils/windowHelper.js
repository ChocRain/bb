/**
 * Helper class for accessing certain aspects of the window object.
 */
/*global window: true*/ // no window helper without acessing the window
define([
    "jquery"
], function (
    $
) {
    "use strict";

    var $window = $(window);

    var onBlur = $window.blur.bind($window);
    var onFocus = $window.focus.bind($window);
    var onResize = $window.resize.bind($window);

    return {
        onBlur: onBlur,
        onFocus: onFocus,
        onResize: onResize
    };
});
