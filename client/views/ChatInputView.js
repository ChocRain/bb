/**
 * View for the input box for the chat.
 */
define([
    "views/BaseView",
    "text!templates/ChatInputView.html",
    "models/ChatMessageModel",
    "utils/validator"
], function (
    BaseView,
    Template,
    ChatMessageModel,
    validator
) {
    "use strict";

    var ChatInputView = BaseView.extend({
        className: "chat-input-view view",
        template: Template,

        events: {
            "submit form": "sendChatMessage"
        },

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.constraints = validator.getConstraints("chat-message");

            return BaseView.prototype.render.call(this, opts);
        },

        sendChatMessage: function (e) {
            if (e) {
                e.preventDefault();
            }

            var $text = this.$("form input[name=text]");
            var text = $text.val();

            // TODO: Nicer validation

            var attrs = {
                text: text
            };

            var validationResult = validator.validate("chat-message", attrs);

            if (!validationResult.hasErrors) {
                var model = new ChatMessageModel();
                model.sendMessage(text);

                $text.val("");
            } else {
                // TODO: Handle nicely
                console.log(validationResult);

                var constraints = validator.getConstraints("chat-message");

                var errorMsg = "Please enter a message. ";
                errorMsg += "May not be longer than ";
                errorMsg += constraints.text.maxlength;
                errorMsg += " characters. ";

                /*global alert: true*/ // TODO: Nicer handling
                alert(errorMsg);
            }
        }
    });

    return ChatInputView;
});

