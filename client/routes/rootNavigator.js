/**
 * The root navigator (singleton).
 */
define([
    "routes/BaseNavigator"
], function (
    BaseNavigator
) {
    "use strict";

    var RootNavigator = BaseNavigator.extend({
        root: function () {
            return this.createRoute("");
        },

        login: function () {
            return this.createRoute("login");
        }
    });

    return new RootNavigator();
});

