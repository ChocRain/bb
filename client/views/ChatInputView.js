/**
 * View for the input box for the chat.
 */
define([
    "underscore",
    "views/BaseView",
    "text!templates/ChatInputView.html",
    "models/ChatMessageModel",
    "utils/commands",
    "shared/utils/validator",
    "shared/exceptions/ValidationException",
    "utils/InputCompletor",
    "collections/chatRoomUsersCollection",
    "models/userSession"
], function (
    _,
    BaseView,
    Template,
    ChatMessageModel,
    commands,
    validator,
    ValidationException,
    InputCompletor,
    chatRoomUsersCollection,
    userSession
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

            BaseView.prototype.render.call(this, opts);

            this._inputCompletor = new InputCompletor(
                this.$("input[name=text]"),
                function (prefix) {
                    // Always complete nicks for now.
                    var nicksInRoom = chatRoomUsersCollection.map(function (userModel) {
                        return userModel.getNick();
                    });
                    var myNick = userSession.getUser().getNick();
                    return _.filter(nicksInRoom, function (nick) {
                        return nick !== myNick;
                    });
                }
            );

            return this;
        },

        sendChatMessage: function (e) {
            if (e) {
                e.preventDefault();
            }

            var $text = this.$("form input[name=text]");
            var text = $text.val();

            if (commands.isCommand(text)) {
                commands.exec(text);
                $text.val("");
                return;
            }

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

