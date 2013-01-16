/**
 * The main entrypoint of the application invoked after configuring require.js.
 */
define([
    "jquery",
    "crafty",
    "util/Socket"
], function (
    $,
    Crafty,
    Socket
) {
    "use strict";

    // TODO: Clean up...

    var App = function () {
        // initialize socket
        var socket = new Socket({
            connected: function () {
                $('#incomingChatMessages').append($('<li>Connected</li>'));
            }.bind(this),

            disconnected: function() {
                $('#incomingChatMessages').append('<li>Disconnected</li>');
            }.bind(this),

            message: function (type, payload) {
                // TODO: Clean up
                var li = $('<li></li>');

                switch (type) {
                    case "server.user.entered":
                        var nick = payload.nick;
                        li.append($('<span class="nick"></span>').text("[" + nick + "]"));
                        li.append($('<span class="action"></span>').text("Entered the chat..."));
                        $('#incomingChatMessages').append(li);
                    break;
                    case "server.chat.message":
                        var nick = payload.nick;
                        var text = payload.text;

                        li.append($('<span class="nick"></span>').text("[" + nick + "]"));
                        li.append($('<span class="text"></span>').text(text));
                        $('#incomingChatMessages').append(li);
                    break;
                }
            }.bind(this)
        });

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

            socket.send("client.user.enter", {
                nick: $nick.val()
            });
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

                socket.send("client.chat.message", {
                    text: $chatboxText.val()
                });
                $chatboxText.val('');
            }
        }.bind(this));
    };

    return App;
});

window.onload = function() {

};
