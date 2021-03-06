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
    "json!shared/definitions/rules.json",
    "json!shared/definitions/status.json",
    "utils/InputCompletor",
    "collections/chatRoomMembersCollection",
    "models/userSession",
    "utils/string",
    "utils/dialog"
], function (
    _,
    BaseView,
    Template,
    ChatMessageModel,
    commands,
    validator,
    ValidationException,
    rules,
    status,
    InputCompletor,
    chatRoomMembersCollection,
    userSession,
    stringUtil,
    dialog
) {
    "use strict";

    var staticCompletions = {
        "rule": _.map(rules.dos.concat(rules.donts), function (rule) {
            return rule.tag;
        }),
        "status": _.keys(status)
    };

    var ChatInputView = BaseView.extend({
        className: "chat-input-view view",
        template: Template,

        events: {
            "click form": "doFocus",
            "submit form": "sendChatMessage"
        },

        doFocus: function (e) {
            this.$("input[name=text]").focus();
        },

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.nick = userSession.getUser().getNick();
            opts.viewModel.constraints = validator.getConstraints("client.room.message");

            BaseView.prototype.render.call(this, opts);

            this._inputCompletor = new InputCompletor(
                this.$("input[name=text]"),
                function (prefix) {
                    var completionType = "";

                    if (commands.isCommand(prefix)) {
                        var endsWithSpace = stringUtil.isWhitespaceString(prefix.charAt(prefix.length - 1));
                        var numArgs = stringUtil.words(prefix).length - 1;

                        if (!endsWithSpace && numArgs === 0) {
                            // we are completing the command name
                            return commands.getCommandNames();
                        }

                        var argTypes = commands.findArgTypes(prefix);
                        if (argTypes === null) {
                            // command is complete
                            return [];
                        }

                        var argIndexToComplete = numArgs - 1;
                        if (endsWithSpace) {
                            // we need to complete the next argument, as we have
                            // a space in before
                            argIndexToComplete += 1;
                        }
                        completionType = argTypes[argIndexToComplete];
                    } else {
                        // complete nick always if not completing a command
                        completionType = "nick";
                    }

                    switch (completionType) {

                    case "nick":
                        // Always complete nicks for now.
                        var nicksInRoom = chatRoomMembersCollection.map(function (memberModel) {
                            return memberModel.getNick();
                        });
                        var myNick = userSession.getUser().getNick();
                        return _.sortBy(_.filter(nicksInRoom, function (nick) {
                            return nick !== myNick;
                        }), function (nick) {
                            return nick.toLowerCase();
                        });

                    case "rule":
                        return staticCompletions.rule;

                    case "status":
                        return staticCompletions.status;

                    }

                    return [];
                }
            );

            return this;
        },

        sendChatMessage: function (e) {
            if (e) {
                e.preventDefault();
            }

            var $text = this.$("form input[name=text]");
            var text = $text.val().trim();

            if (commands.isCommand(text)) {
                commands.exec(text, staticCompletions);
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

                    var errorMsg = "The message may not be longer than ";
                    errorMsg += constraints.text.maxLength;
                    errorMsg += " characters. ";

                    dialog.showMessage(
                        "Please enter a message",
                        errorMsg,
                        "OK",
                        function () {
                            $text.focus();
                        }
                    );
                } else {
                    // re-throw any unhandled exception
                    throw err;
                }
            }
        }
    });

    return ChatInputView;
});

