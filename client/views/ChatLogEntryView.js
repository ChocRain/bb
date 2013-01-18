/**
 * View for an entry of the chat log.
 */
define([
    "views/BaseView",
    "text!templates/ChatLogEntryView.html"
], function (
    BaseView,
    Template
) {
    "use strict";

    var ChatLogEntryView = BaseView.extend({
        tagName: "li",
        className: "chat-log-entry-view view",
        template: Template
    });

    return ChatLogEntryView;
});

