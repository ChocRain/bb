/**
 * The root router.
 */
define([
    "underscore",
    "backbone",
    "models/userSession",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    Backbone,
    userSession,
    IllegalArgumentException
) {
    "use strict";

    var BaseRouter = Backbone.Router.extend({
        initialize: function (opts) {
            Backbone.Router.prototype.initialize.call(this, opts);

            if (this.loggedInRoutes) {
                if (!_.isObject(this.loggedInRoutes)
                        || !_.isFunction(this.loginRoute)) {
                    throw new IllegalArgumentException("Router not set up correctly for logged in routes!");
                }

                _.each(this.loggedInRoutes, function (callbackName, route) {
                    var originalCallback = this[callbackName];

                    if (!_.isFunction(originalCallback)) {
                        throw new IllegalArgumentException("Invalid callback for route: " + callbackName);
                    }

                    // wrap callback
                    var wrappedCallback = function () {
                        if (userSession.isLoggedIn()) {
                            originalCallback.apply(this, arguments);
                        } else {
                            var loginRoute = this.loginRoute(Backbone.history.fragment);
                            loginRoute.go();
                        }
                    }.bind(this);

                    this.route(route, callbackName, wrappedCallback);
                }, this);
            }
        }
    });

    return BaseRouter;
});
