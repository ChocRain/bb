/**
 * The main entrypoint of the application invoked after configuring require.js.
 */
define([
    "underscore",
    "jquery",
    "backbone",
    "utils/clientMessageSource",
    "routes/RootRouter",
    "crafty",
    "utils/spinner",
    "scenes/titleScene",
    "utils/commands"
], function (
    _,
    $,
    Backbone,
    messageSource,
    RootRouter,
    Crafty,
    spinner,
    titleScene
) {
    "use strict";

    var App = Backbone.View.extend({
        initialize: function () {
            var $ui = $("#ui");

            var connectingSpinner = spinner.create();
            $ui.append(connectingSpinner.el);

            messageSource.init({
                sessionInitialized: function () {
                    connectingSpinner.stop();

                    // start navigation
                    var rootRouter = new RootRouter();
                    Backbone.history.start({pushState: true});

                    // init crafty for full window usage
                    Crafty.init();

                    // show title screen scene
                    titleScene.run();
                }.bind(this)
            });
        }
    });

    return App;
});

