/**
 * View showing the list of all the chat room members.
 */
define([
    "views/ListView",
    "views/ChatRoomMembersListItemView",
    "collections/chatRoomMembersCollection"
], function (
    ListView,
    ChatRoomMembersListItemView,
    chatRoomMembersCollection
) {
    "use strict";

    var ChatRoomMembersListView = ListView.extend({
        className: "chat-room-members-list-view view",
        collection: chatRoomMembersCollection,

        createItemView: function (model) {
            return new ChatRoomMembersListItemView({model: model});
        }
    });

    return ChatRoomMembersListView;
});

