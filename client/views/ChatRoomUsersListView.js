/**
 * View showing the list of all the chat room users.
 */
define([
    "views/ListView",
    "views/ChatRoomUserListItemView",
    "collections/chatRoomUsersCollection"
], function (
    ListView,
    ChatRoomUserListItemView,
    chatRoomUsersCollection
) {
    "use strict";

    var ChatRoomUsersListView = ListView.extend({
        className: "chat-room-users-list-view view",
        collection: chatRoomUsersCollection,

        createItemView: function (model) {
            return new ChatRoomUserListItemView({model: model});
        }
    });

    return ChatRoomUsersListView;
});

