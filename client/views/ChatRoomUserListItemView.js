/**
 * View for an entry in the ChatRoomUsersListView.
 */
define([
    "views/BaseView",
    "text!templates/ChatRoomUserListItemView.html"
], function (
    BaseView,
    Template
) {
    "use strict";

    var ChatRoomUserListItemView = BaseView.extend({
        tagName: "li",
        className: "chat-room-user-list-item-view view",
        template: Template
    });

    return ChatRoomUserListItemView;
});

