/**
 * View for the input box for the chat.
 */
define([
    "views/BaseView",
    "text!templates/ChatInputView.html"
], function (
    BaseView,
    Template
) {
    "use strict";

    var ChatInputView = BaseView.extend({
        className: "chat-input-view view",
        template: Template
    });

    return ChatInputView;
});

