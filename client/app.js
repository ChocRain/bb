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

    // TODO: Clean up...

    var App = Backbone.View.extend({
        initialize: function () {
            // start navigation
            new RootRouter();
            Backbone.history.start();

            // TODO: Clean up below...


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

    /*
            // Cruel code for chat handling. TODO: Rewrite.

            var $chatboxText = $('#chatbox input.text');
            $chatboxText.keypress(function(e) {
                if(e.which == 13) {
                    e.preventDefault();

                    if (!this._sessionId) {
                        alert("Enter a nick first!");
                        return;
                    }

                    messageDispatcher.sendChatMessage($chatboxText.val());
                    $chatboxText.val('');
                }
            }.bind(this));
    */
        }
    });

    return App;
});

window.onload = function() {

};
