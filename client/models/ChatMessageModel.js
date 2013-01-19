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
    "use strict";

    var ChatMessageModel = BaseModel.extend({
        sendMessage: function (text) {
            messageSink.sendChatMessage(text);
        }
    });

    return ChatMessageModel;
});

