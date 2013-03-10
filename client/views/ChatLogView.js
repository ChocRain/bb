/**
 * View for the chat log.
 */
define([
    "views/ListView",
    "views/ChatLogEntryView",
    "collections/chatLogCollection",
    "utils/windowHelper"
], function (
    ListView,
    ChatLogEntryView,
    chatLogCollection,
    windowHelper
) {
    "use strict";

    var ChatLogView = ListView.extend({
        className: "chat-log-view view",
        collection: chatLogCollection,

        _hasBeenRendered: false,
        _autoScroll: true,
        _autoScrollOffset: 20,

        events: {
            "scroll": "handleScroll"
        },

        createItemView: function (model) {
            return new ChatLogEntryView({model: model});
        },

        handleScroll: function (e) {
            this._autoScroll =
                    this.$el.scrollTop() + this.$el.innerHeight() >= this.el.scrollHeight - this._autoScrollOffset;
        },

        add: function (model) {
            ListView.prototype.add.call(this, model);

            if (this._hasBeenRendered && this._autoScroll) {
                // scroll chat log
                this.$el.stop().animate({
                    scrollTop: this.el.scrollHeight
                }, 1000);
            }
        },

        render: function (opts) {
            ListView.prototype.render.call(this, opts);
            this._hasBeenRendered = true;

            windowHelper.onBlur(this.updateLastRead.bind(this));

            return this;
        },

        updateLastRead: function () {
            var entryClass = "chat-log-entry-view";
            var lastReadClass = "last-read";

            this.$("." + entryClass + "." + lastReadClass).toggleClass(lastReadClass, false);
            this.$("." + entryClass).filter(":last").toggleClass(lastReadClass, true);
        }
    });

    return ChatLogView;
});

