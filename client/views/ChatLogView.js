/**
 * View for the chat log.
 */
define([
    "views/BaseView",
    "text!templates/ChatLogView.html"
], function (
    BaseView,
    Template
) {
    "use strict";

    var ChatLogView = BaseView.extend({
        className: "chat-log-view view",
        template: Template
    });

    return ChatLogView;
});

