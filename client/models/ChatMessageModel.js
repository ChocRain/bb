/**
 * Model representing a chat message.
 */
define([
    "models/BaseModel",
    "utils/clientMessageSink"
], function (
    BaseModel,
    messageSink
) {
    var ChatMessageModel = BaseModel.extend({
        sendMessage: function (text) {
            messageSink.sendChatMessage(text);
        }
    });

    return ChatMessageModel;
});

