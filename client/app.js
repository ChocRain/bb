/**
 * The main entrypoint of the application invoked after configuring require.js.
 */
define([
    "jquery",
    "backbone",
    "utils/clientMessageSource",
    "routes/RootRouter",
    "crafty"
], function (
    $,
    Backbone,
    messageSource, // initialize implicitely
    RootRouter,
    Crafty
) {
    "use strict";

    var App = Backbone.View.extend({
        initialize: function () {
            // start navigation
            var rootRouter = new RootRouter();
            Backbone.history.start();

            // TODO: Get crafty into shape... (e.g. move code below to own modules)

            // initialize crafty
            Crafty.init();
            Crafty.background('rgb(127,127,127)');

            // Hack to allow usage of input fields, as Crafty will handle all keyboard events otherwise.
            $("input").focus(function () {
                Crafty.removeEvent(this, "keydown", Crafty.keyboardDispatch);
                Crafty.removeEvent(this, "keyup", Crafty.keyboardDispatch);
            });

            $("input").blur(function () {
                Crafty.addEvent(this, "keydown", Crafty.keyboardDispatch);
                Crafty.addEvent(this, "keyup", Crafty.keyboardDispatch);
            });
        }
    });

    return App;
});

