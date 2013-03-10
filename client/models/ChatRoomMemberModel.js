/**
 * Model representing a member within a chat room.
 */
define([
    "models/BaseModel",
    "shared/models/PublicUser"
], function (
    BaseModel,
    PublicUser
) {
    "use strict";

    var ChatRoomMemberModel = BaseModel.extend({
        idAttribute: "nick",

        parse: function (json) {
            return {
                nick: json.user.nick,
                user: json.user,
                position: json.position,
                avatar: json.avatar
            };
        },

        getNick: function () {
            return this.get("nick");
        },

        getUser: function () {
            return PublicUser.fromJSON(this.get("user"));
        },

        setPosition: function (position) {
            this.set("position", position);
        },

        getPosition: function () {
            return this.get("position");
        },

        setAvatar: function (avatar) {
            this.set("avatar", avatar);
        },

        getAvatar: function () {
            return this.get("avatar");
        }
    });

    return ChatRoomMemberModel;
});

