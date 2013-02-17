/**
 * String utils.
 */
define([
    "underscore",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    IllegalArgumentException
) {
    "use strict";

    return {
        /**
         * Repeats the given string n times. If n === 0 then "" is returned.
         */
        repeat: function (str, n) {
            if (!_.isString(str)) {
                throw new IllegalArgumentException("repeat: First parameter must be a string.");
            }
            if (!_.isNumber(n) || n < 0) {
                throw new IllegalArgumentException("repeat: Second parameter must be positive (or 0) number.");
            }

            var result = "";
            var i;

            for (i = 0; i < n; i += 1) {
                result += str;
            }

            return result;
        },

        /**
         * Removes leading and trailing whitespace characters and replaces
         * mulitple whitespace characters by one all over the string.
         */
        clean: function (str) {
            if (!_.isString(str)) {
                throw new IllegalArgumentException("clean: First parameter must be a string.");
            }

            return str.trim().replace(/[\s]+/g, " ");
        },

        /**
         * Returns an array of all the words within the string. Words may be
         * delimited by one or more whitespace characters.
         */
        words: function (str) {
            if (!_.isString(str)) {
                throw new IllegalArgumentException("clean: First parameter must be a string.");
            }

            return this.clean(str).split(" ");
        }
    };
});

