/**
 * The main entrypoint of the application invoked after configuring require.js.
 */
define([
    "jquery",
    "backbone",
    "utils/clientMessageSource",
    "routes/RootRouter",
    "crafty",
    "utils/spinner"
], function (
    $,
    Backbone,
    messageSource,
    RootRouter,
    Crafty,
    spinner
) {
    "use strict";

    var App = Backbone.View.extend({
        initialize: function () {
            var connectingSpinner = spinner.create();
            $("#ui").append(connectingSpinner.el);

            messageSource.init({
                connected: function () {
                    connectingSpinner.stop();

                    // start navigation
                    var rootRouter = new RootRouter();
                    Backbone.history.start();

                    // TODO: Get crafty into shape... (e.g. move code below to own modules)

                    // initialize crafty
                    Crafty.init();
                    Crafty.background('rgb(127,127,127)');

                }.bind(this)
            });
        }
    });

    return App;
});

