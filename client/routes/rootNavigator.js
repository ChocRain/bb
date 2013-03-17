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
        _redirectAfterLogin: null,

        root: function () {
            return this.createRoute("");
        },

        rules: function (ruleName) {
            var path = "rules";
            if (ruleName) {
                path += "#" + ruleName;
            }
            return this.createRoute(path);
        },

        credits: function (objectName) {
            var path = "credits";
            if (objectName) {
                path += "#" + objectName;
            }
            return this.createRoute(path);
        },

        login: function (redirect) {
            var suffix = redirect ? "/" + redirect : "";
            return this.createRoute("login" + suffix);
        },

        setRedirectAfterLogin: function (redirect) {
            this._redirectAfterLogin = redirect || null;
        },

        redirectAfterLogin: function () {
            if (this._redirectAfterLogin) {
                var route = this.createRoute(this._redirectAfterLogin);
                this._redirectAfterLogin = null;
                route.go();
            } else {
                this.root().go();
            }
        }
    });

    return new RootNavigator();
});

