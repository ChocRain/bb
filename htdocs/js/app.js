/**
 * The main entrypoint of the application invoked after configuring require.js.
 */
define([
    "jquery",
    "crafty",
    "socket.io"
], function (
    $,
    Crafty,
    io
) {
    "use strict";

    // TODO: Clean up...

    var App = function () {
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

        var iosocket = io.connect();

        iosocket.on('connect', function () {
            $('#incomingChatMessages').append($('<li>Connected</li>'));

            iosocket.on('message', function(messageStr) {
                var message = JSON.parse(messageStr);
                var payload = message.payload;
                var nick = payload.nick;
                var text = payload.text;

                var li = $('<li></li>');
                li.append($('<span class="nick"></span>').text("[" + nick + "]"));
                li.append($('<span class="text"></span>').text(text));
                $('#incomingChatMessages').append(li);
            });
            iosocket.on('disconnect', function() {
                $('#incomingChatMessages').append('<li>Disconnected</li>');
            });
        });

        var $chatboxText = $('#chatbox input.text');
        $chatboxText.keypress(function(event) {
            if(event.which == 13) {
                event.preventDefault();

                iosocket.send(JSON.stringify({
                    type: "client.chat.message",
                    payload: {
                        text: $chatboxText.val()
                    }
                }));
                $chatboxText.val('');
            }
        });
    };

    return App;
});

window.onload = function() {

};
