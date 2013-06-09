/**
 * Hack to allow usage of input fields, as Crafty will handle all keyboard events otherwise.
 */
define([
    "crafty"
], function (
    Crafty
) {
    "use strict";

    return {
        applyHack: function ($el) {
            $el.focus(function () {
                Crafty.removeEvent(this, "keydown", Crafty.keyboardDispatch);
                Crafty.removeEvent(this, "keyup", Crafty.keyboardDispatch);
            });

            $el.blur(function () {
                Crafty.addEvent(this, "keydown", Crafty.keyboardDispatch);
                Crafty.addEvent(this, "keyup", Crafty.keyboardDispatch);
            });
        }
    };
});
