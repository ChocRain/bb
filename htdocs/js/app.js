/**
 * The main entrypoint of the application invoked after configuring require.js.
 */
define([
    "jquery",
    "crafty",
    "util/ClientMessageDispatcher"
], function (
    $,
    Crafty,
    MessageDispatcher
) {
    "use strict";

    // TODO: Clean up...

    var App = function () {
        // initialize message dispatcher
        var messageDispatcher = new MessageDispatcher();

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

        // Cruel code for chat handling. TODO: Rewrite.

        var $loginForm = $("#login form");
        $loginForm.submit(function (e) {
            e.preventDefault();

            var $nick = $("#login form input[name=nick]");
            var nick = $nick.val();
            messageDispatcher.sendUserEnter(nick);
        }.bind(this));

        var $chatboxText = $('#chatbox input.text');
        $chatboxText.keypress(function(e) {
            if(e.which == 13) {
                e.preventDefault();

/*
                if (!this._sessionId) {
                    alert("Enter a nick first!");
                    return;
                }
*/

                messageDispatcher.sendChatMessage($chatboxText.val());
                $chatboxText.val('');
            }
        }.bind(this));
    };

    return App;
});

window.onload = function() {

};
