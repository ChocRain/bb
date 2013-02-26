/**
 * Model representing an user within a chat room.
 */
define([
    "models/BaseModel",
    "shared/models/roles"
], function (
    BaseModel,
    roles
) {
    "use strict";

    var ChatRoomUserModel = BaseModel.extend({
        idAttribute: "nick",

        parse: function (json) {
            return {
                nick: json.nick,
                role: roles.fromString(json.role),
                position: json.position
            };
        },

        getNick: function () {
            return this.get("nick");
        },

        setPosition: function (position) {
            this.set("position", position);
        },

        getPosition: function () {
            return this.get("position");
        }
    });

    return ChatRoomUserModel;
});

