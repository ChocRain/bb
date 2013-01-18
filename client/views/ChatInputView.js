/**
 * View for the input box for the chat.
 */
define([
    "views/BaseView",
    "text!templates/ChatInputView.html",
    "models/ChatMessageModel"
], function (
    BaseView,
    Template,
    ChatMessageModel
) {
    "use strict";

    var ChatInputView = BaseView.extend({
        className: "chat-input-view view",
        template: Template,

        events: {
            "submit form": "sendChatMessage"
        },

        sendChatMessage: function (e) {
            if (e) {
                e.preventDefault();
            }

            var $text = this.$("form input[name=text]");
            var text = $text.val();

            // TODO: Validation

            var model = new ChatMessageModel();
            model.sendMessage(text);

            $text.val("");
        }
    });

    return ChatInputView;
});

