/**
 * View for the chat log.
 */
define([
    "views/ListView",
    "views/ChatLogEntryView",
    "collections/chatLogCollection"
], function (
    ListView,
    ChatLogEntryView,
    chatLogCollection
) {
    "use strict";

    var ChatLogView = ListView.extend({
        className: "chat-log-view view",
        collection: chatLogCollection,

        _hasBeenRendered: false,

        createItemView: function (model) {
            return new ChatLogEntryView({model: model});
        },

        add: function (model) {
            ListView.prototype.add.call(this, model);

            if (this._hasBeenRendered) {
                // scroll chat log
                this.$el.stop().animate({
                    scrollTop: this.el.scrollHeight
                }, 1000);
            }
        },

        render: function (opts) {
            ListView.prototype.render.call(this, opts);

            this._hasBeenRendered = true;

            return this;
        }
    });

    return ChatLogView;
});

