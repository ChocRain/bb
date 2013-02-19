/**
 * A collection of users in the chat room. For now a singleton since we only
 * have one chat room.
 */
define([
    "collections/BaseCollection",
    "models/ChatRoomUserModel"
], function (
    BaseCollection,
    ChatRoomUserModel
) {
    "use strict";

    var ChatRoomUsersCollection = BaseCollection.extend({
        model: ChatRoomUserModel
    });

    return new ChatRoomUsersCollection();
});

