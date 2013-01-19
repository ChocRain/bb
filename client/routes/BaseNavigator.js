/**
 * Base class for navigators.
 */
/*global location: true */
define([
    "backbone"
], function (
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
                    location.hash = "#" + fragment;
                    location.reload();
                }.bind(this)
            };
        }
    });

    return BaseNavigator;
});
