/**
 * Util checking for similarities of nick names.
 */
define([
    "underscore",
    "natural",
    "json!server/definitions/nicknamesBlacklist.json"
], function (
    _,
    natural,
    nicknamesBlacklist
) {
    "use strict";

    /**
     * Cleans up the nick before filtering to remove noise and get a better
     * match.
     */
    var normalizeNick = function (nick) {
        return nick.toLowerCase().replace(/_/g, "").replace(/([a-zA-Z0-9])(?=\1)/g, "");
    };

    /**
     * Normalized nickname blacklist.
     */
    var nNicknamesBlacklist = _.map(nicknamesBlacklist, normalizeNick);

    /**
     * Letter mapping to translate from l33t speak before checking.
     */
    var leetLetters = {
        0: ["o"],
        1: ["i", "l"],
        2: ["r", "z"],
        3: ["e"],
        4: ["a", "h"],
        5: ["s"],
        6: ["b", "g"],
        7: ["t"],
        8: ["b"],
        9: ["g", "p", "q"]
    };

    /**
     * Get all unique translations for l33t speak mappings. Call with n = 0
     * initially.
     */
    var getLeetTranslations = function (n, nick) {
        if (n > 9) {
            // no more digits to map to letters
            return [nick];
        }

        var nicks = [];

        // collect translations for each mapping of n to a letter
        _.each(leetLetters[n], function (letter) {
            nicks = nicks.concat(getLeetTranslations(
                n + 1,
                nick.replace(new RegExp(n, "g"), letter)
            ));
        });

        // There'll surely be duplicates. Get rid of those.
        return _.uniq(nicks);
    };

    /**
     * Checks for similarity of any of the translations to the blacklisted
     * nick.
     */
    var isSimilar = function (nNick, translations, nBlacklistedNick) {
        var isEqual = _.some(translations, function (translation) {
            return nBlacklistedNick === translation;
        });

        if (isEqual) {
            return true;
        }

        // calc distances:

        // http://en.wikipedia.org/wiki/Levenshtein_distance
        var minLevenshteinDistance = _.min(_.map(translations, function (translation) {
            return natural.LevenshteinDistance(translation, nBlacklistedNick);
        }));

        // http://en.wikipedia.org/wiki/Jaro-Winkler_distance
        var maxJaroWinklerDistance = _.max(_.map(translations, function (translation) {
            return natural.JaroWinklerDistance(translation, nBlacklistedNick);
        }));

        // long words allow more operations for similar nicks
        var length = Math.min(nNick.length, nBlacklistedNick.length);
        var normalizedLevenshteinDistance = minLevenshteinDistance / length;

        if (maxJaroWinklerDistance >= 0.8 && normalizedLevenshteinDistance <= 0.25) {
            return true;
        }

        return false;
    };

    return {
        /**
         * Checks if the nick may be used.
         */
        isAllowed: function (nick) {
            if (nick === "") {
                return false;
            }

            var nNick = normalizeNick(nick);
            var translations = getLeetTranslations(0, nNick);

            return _.every(nNicknamesBlacklist, function (nBlacklistedNick) {
                return !isSimilar(nNick, translations, nBlacklistedNick);
            });
        }
    };
});

