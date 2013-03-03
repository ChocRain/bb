/**
 * Util for showing message dialogs.
 */
/*global alert: true*/ // TODO: Use an own dialog view instead of an alert.
define([
], function (
) {
    "use strict";

    return {
        showMessage: function (message) {
            alert(message);
        }
    };
});

