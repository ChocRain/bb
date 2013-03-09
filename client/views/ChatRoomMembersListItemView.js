/**
 * View for an entry in the ChatRoomMembersListView.
 */
define([
    "views/BaseView",
    "text!templates/ChatRoomMembersListItemView.html"
], function (
    BaseView,
    Template
) {
    "use strict";

    var ChatRoomMembersListItemView = BaseView.extend({
        tagName: "li",
        className: "chat-room-members-list-item-view view",
        template: Template
    });

    return ChatRoomMembersListItemView;
});

