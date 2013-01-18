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

        createItemView: function (model) {
            return new ChatLogEntryView({model: model});
        }
    });

    return ChatLogView;
});

