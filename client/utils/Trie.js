/**
 * Trie data structure used for completion.
 */
define([
    "underscore",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    IllegalArgumentException
) {
    "use strict";

    /**
     * Gets the sub-Trie specified by the key. Creates it if it doesn't exist.
     */
    var _ensureSubTrie = function (trie, key) {
        if (key === "") {
            return trie;
        }

        var c = key.charAt(0);
        trie[c] = trie[c] || {};

        return _ensureSubTrie(trie[c], key.substr(1));
    };

    /**
     * Inserts the value for the given key into the Trie.
     */
    var _insert = function (trie, key, value) {
        var subTrie = _ensureSubTrie(trie, key);
        subTrie.entry = value;
    };

    /**
     * Returns the sub-Trie for the specified prefix. If none exists null returned.
     */
    var _findSubTrie = function (trie, prefix) {
        if (prefix === "") {
            return trie;
        }

        var subTrie = trie[prefix.charAt(0)];

        if (!subTrie) {
            return null;
        }

        return _findSubTrie(subTrie, prefix.substr(1));
    };

    /**
     * Gets all the keys in the Trie. Requires to be called with an empty
     * string as initial accumulator for the key and an empty array as initial
     * accumulator for the results.
     */
    var _getKeys = function (trie, accKey, accKeys) {
        if (_.isString(trie.entry)) {
            accKeys.push(accKey);
        }

        var chars = _.filter(_.keys(trie), function (key) {
            return key.length === 1;
        });

        _.each(chars, function (c) {
            _getKeys(trie[c], accKey + c, accKeys);
        });

        return accKeys;
    };

    /**
     * Gets all the values in the Trie. Requires to be called with an empty
     * array as initial accumulator.
     */
    var _getValues = function (trie, accValues) {
        if (_.isString(trie.entry)) {
            accValues.push(trie.entry);
        }

        var chars = _.filter(_.keys(trie), function (key) {
            return key.length === 1;
        });

        _.each(chars, function (c) {
            _getValues(trie[c], accValues);
        });

        return accValues;
    };

    /**
     * Creates a string Trie initialized with an optional array of words.
     */
    var Trie = function (ignoreCase, opt_words) {
        this._ignoreCase = !!ignoreCase;
        this._data = {};

        if (_.isArray(opt_words)) {
            this.insertAll(opt_words);
        }
    };

    /**
     * Insert a word into the Trie.
     */
    Trie.prototype.insert = function (word) {
        if (!_.isString(word)) {
            throw new IllegalArgumentException("Word must be a string.");
        }

        _insert(this._data, this._ignoreCase ? word.toLowerCase() : word, word);
    };

    /**
     * Inserts all words into the Trie.
     */
    Trie.prototype.insertAll = function (words) {
        if (!_.isArray(words)) {
            throw new IllegalArgumentException("Words must be an array.");
        }

        _.each(words, function (word) {
            this.insert(word);
        }.bind(this));
    };

    /**
     * A sub-Trie with a reduced feature set.
     */
    var SubTrie = function (ignoreCase, data) {
        this._ignoreCase = !!ignoreCase;
        this._data = data;
    };

    /**
     * Common methods shared between Trie and SubTrie.
     */
    var TrieMixin = {
        /**
         * Returns the SubTrie for the specified prefix. If none exists null is
         * returned.
         */
        findSubTrie: function (prefix) {
            if (!_.isString(prefix)) {
                throw new IllegalArgumentException("Prefix must be a string.");
            }

            var subTrie = _findSubTrie(this._data, this._ignoreCase ? prefix.toLowerCase() : prefix);
            if (_.isObject(subTrie)) {
                return new SubTrie(this._ignoreCase, subTrie);
            }
            return null;
        },

        /**
         * Gets an array of the suffixes of the words regarding the prefix the
         * (Sub)Trie is for.
         */
        getWordSuffixes: function () {
            return _getKeys(this._data, "", []);
        },

        /**
         * Gives an array of all the complete words in the (Sub)Trie.
         */
        getCompleteWords: function () {
            return _getValues(this._data, []);
        }
    };

    _.extend(Trie.prototype, TrieMixin);
    _.extend(SubTrie.prototype, TrieMixin);

    return Trie;
});

