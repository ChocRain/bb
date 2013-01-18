/**
 * A collection of chat log entries. For now a singleton since we only have
 * one chat.
 */
define([
    "collections/BaseCollection",
    "models/ChatLogEntryModel"
], function (
    BaseCollection,
    ChatLogEntryModel
) {
    "use strict";

    var ChatLogCollection = BaseCollection.extend({
        model: ChatLogEntryModel
    });

    return new ChatLogCollection();
});
