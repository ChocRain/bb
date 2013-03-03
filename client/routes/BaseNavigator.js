/**
 * Base class for navigators.
 */
/*global location: true */
define([
    "underscore",
    "backbone"
], function (
    _,
    Backbone
) {
    "use strict";

    var BaseNavigator = Backbone.Router.extend({
        createRoute: function (fragment) {
            return {
                go: function () {
                    this.navigate(fragment, {
                        trigger: true, // trigger route
                        replace: true  // track in history
                    });
                }.bind(this),

                goSilent: function () {
                    this.navigate(fragment, {
                        trigger: true, // trigger route
                        replace: false // don't track in history
                    });
                }.bind(this),

                reload: function () {
                    this.reload(fragment);
                }.bind(this)
            };
        },

        reload: function (opt_fragment) {
            var fragment = _.isString(opt_fragment) ? opt_fragment : Backbone.history.fragment;

            location.hash = "#" + fragment;
            location.reload();
        },

        loadUrl: function (url) {
            location.href = url;
        }
    });

    return BaseNavigator;
});
