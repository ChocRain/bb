/**
 * A collection of members in the chat room. For now a singleton since we only
 * have one chat room.
 */
define([
    "collections/BaseCollection",
    "models/ChatRoomMemberModel"
], function (
    BaseCollection,
    ChatRoomMemberModel
) {
    "use strict";

    var ChatRoomMembersCollection = BaseCollection.extend({
        model: ChatRoomMemberModel
    });

    return new ChatRoomMembersCollection();
});

