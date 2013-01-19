/**
 * The root router.
 */
define([
    "underscore",
    "backbone",
    "models/userSession"
], function (
    _,
    Backbone,
    userSession
) {
    var BaseRouter = Backbone.Router.extend({
        initialize: function (opts) {
            Backbone.Router.prototype.initialize.call(this, opts);

            if (this.loggedInRoutes) {
                if (!_.isObject(this.loggedInRoutes)
                    || !_.isFunction(this.loginRoute)
                ) {
                    throw new Error("Router not set up correctly for logged in routes!");
                }

                _.each(this.loggedInRoutes, function (callbackName, route) {
                    var originalCallback = this[callbackName];

                    if (!_.isFunction(originalCallback)) {
                        throw new Error("Invalid callback for route: " + callbackName);
                    }

                    // wrap callback
                    var wrappedCallback = function () {
                        if (userSession.isLoggedIn()) {
                            originalCallback.apply(this, arguments);
                        }
                        else {
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
