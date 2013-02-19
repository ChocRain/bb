/**
 * Class for tab completing input fields
 */
define([
    "underscore",
    "utils/Trie"
], function (
    _,
    Trie
) {
    "use strict";

    /**
     * Create a new InputCompleter.
     *
     * @param $input         jQuery object for the input element
     * @param getDictionary  Function giving the dictionary for completion
     *                       depending on the given input prefix.
     */
    var InputCompleter = function ($input, getDictionary) {
        // params
        this._$input = $input;
        this._getDictionary = getDictionary;

        // completion state
        this._shallCycle = false;

        // bind
        this._$input.keydown(this._handleKeydown.bind(this));
    };

    InputCompleter.prototype._handleKeydown = function (e) {
        if (e.keyCode === 9) { // tab
            e.preventDefault();

            this._complete();
        } else {
            this._shallCycle = false;
        }
    };

    InputCompleter.prototype._complete = function () {
        // decide wether to cycle or to start a new completion 
        var caretPos = this._$input.caret().start;
        var text = this._$input.val();
        this._shallCycle =
            this._shallCycle && caretPos === this._expectedCarretPos && text === this._expectedText;

        // split text for completion
        var completionStartPos = this._shallCycle ? this._prevCompletionStartPos : caretPos;
        var textBeforeCompletion = text.substring(0, completionStartPos);
        var textAfterCompletion = text.substring(this._shallCycle ? caretPos : completionStartPos);

        // get trie for completion
        var trie = new Trie(true, this._getDictionary(textBeforeCompletion));

        // get completion
        var wordToComplete = textBeforeCompletion.match(/[a-zA-Z0-9_]*$/)[0];
        var subTrie = trie.findSubTrie(wordToComplete);

        if (!subTrie) {
            this._shallCycle = false;
            return; // nothing to complete
        }

        var completions = _.sortBy(subTrie.getCompleteWords(), function (completion) {
            return completion.toLowerCase();
        });
        var numCompletions = _.size(completions);

        if (numCompletions <= 0) {
            this._shallCycle = false;
            return; // nothing to complete
        }

        var completionIndex = this._shallCycle ? (this._prevCompletionIndex + 1) % completions.length : 0;
        var completion = completions[completionIndex];

        // new text and new caret position
        var wordStartPos = textBeforeCompletion.length - wordToComplete.length;
        var newText = textBeforeCompletion.substring(0, wordStartPos) + completion;
        var newCaretPos = wordStartPos + completion.length;

        if (numCompletions === 1) {
            // only set caret one off if exactly know what to complete
            newCaretPos += 1;

            if (textAfterCompletion.charAt(0) !== " ") {
                // only add space if neccessary (we don't want duplicates)
                newText += " ";
            }

            // we have nothing to cycle through
            this._shallCycle = false;
        } else {
            if (textAfterCompletion.length > 0 && textAfterCompletion.charAt(0) !== " ") {
                // set of suffix by one space when cycling (not at end of input though)
                newText += " ";
            }

            this._shallCycle = true;
        }

        newText += textAfterCompletion;

        // update input field's text and caret position
        this._$input.val(newText);
        this._$input.caret(newCaretPos, newCaretPos); // no selection, just set caret

        // update state for cycling
        this._prevCompletionStartPos = completionStartPos;
        this._prevCompletionIndex = completionIndex;
        this._expectedCarretPos = newCaretPos;
        this._expectedText = newText;
    };

    return InputCompleter;
});
