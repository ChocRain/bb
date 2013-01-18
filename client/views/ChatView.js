/**
 * View for the whole chat.
 */
define([
    "views/BaseView",
    "text!templates/ChatView.html",
    "views/ChatLogView",
    "views/ChatInputView"
], function (
    BaseView,
    Template,
    ChatLogView,
    ChatInputView
) {
    "use strict";

    var ChatView = BaseView.extend({
        className: "chat-view view",
        template: Template,

        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            this._chatLogView = new ChatLogView();
            this._chatInputView = new ChatInputView();
        },

        render: function (opts) {
            BaseView.prototype.render.call(this, opts);

            this.$(".chat-log").html(this._chatLogView.render().el);
            this.$(".chat-input").html(this._chatInputView.render().el);

            return this;
        }
    });

    return ChatView;
});

