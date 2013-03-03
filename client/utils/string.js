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
        },

        /**
         * Returns true if the string isn't empty and contains only whitespace
         * characters. Returns false otherwise.
         */
        isWhitespaceString: function (str) {
            if (!_.isString(str)) {
                throw new IllegalArgumentException("isWhitespaceOnly: First parameter must be a string.");
            }

            return !!str.match(/^[\s]+/);
        },

        /**
         * Splits the given string into an array of lines. Each line is at
         * maximum allowedLineLength characters long, as long as there is
         * no word within string being longer than allowedLineLength. In that
         * case those words will be placed onto an own line each. The string
         * is only split between words. All the whitespace characters in the
         * resulting line strings are normalized as described for clean().
         */
        toWrappedLines: function (str, allowedLineLength) {
            var words = this.words(str);
            var lines = [];
            var currentLine = "";

            _.each(words, function (word) {
                if (word.length > allowedLineLength) {
                    // we do not wrap within words and thus this word is one line
                    if (currentLine !== "") {
                        lines.push(currentLine);
                        currentLine = "";
                    }

                    lines.push(word);
                } else if (currentLine === "") {
                    currentLine = word;
                } else if (currentLine.length + word.length + 1 > allowedLineLength) {
                    // we need to wrap
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine += " " + word;
                }
            });

            if (currentLine !== "") {
                lines.push(currentLine);
            }

            return lines;
        }
    };
});

