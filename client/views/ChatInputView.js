/**
 * View for the input box for the chat.
 */
define([
    "views/BaseView",
    "text!templates/ChatInputView.html",
    "models/ChatMessageModel",
    "utils/validator",
    "shared/exceptions/ValidationException"
], function (
    BaseView,
    Template,
    ChatMessageModel,
    validator,
    ValidationException
) {
    "use strict";

    var ChatInputView = BaseView.extend({
        className: "chat-input-view view",
        template: Template,

        initialFocus: "input[name=text]",

        events: {
            "submit form": "sendChatMessage"
        },

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.constraints = validator.getConstraints("client.room.message");

            return BaseView.prototype.render.call(this, opts);
        },

        sendChatMessage: function (e) {
            if (e) {
                e.preventDefault();
            }

            var $text = this.$("form input[name=text]");
            var text = $text.val();

            try {
                var model = new ChatMessageModel();
                model.sendMessage(text);
                $text.val("");
            } catch (err) {
                if (err instanceof ValidationException) {
                    var constraints = validator.getConstraints("client.room.message");

                    var errorMsg = "Please enter a message. ";
                    errorMsg += "May not be longer than ";
                    errorMsg += constraints.text.maxlength;
                    errorMsg += " characters. ";

                    /*global alert: true*/ // TODO: Nicer handling
                    alert(errorMsg);
                } else {
                    // re-throw any unhandled exception
                    throw err;
                }
            }
        }
    });

    return ChatInputView;
});

