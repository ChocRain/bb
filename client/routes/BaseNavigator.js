/**
 * Base class for navigators.
 */
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
                    debugger;
                    this.navigate(fragment, {
                        trigger: true, // trigger route
                        replace: false // don't track in history
                    });
                }.bind(this)
            };
        }
    });

    return BaseNavigator;
});
