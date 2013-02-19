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
                role: roles.fromString(json.role)
            };
        },

        getNick: function () {
            return this.get("nick");
        }
    });

    return ChatRoomUserModel;
});

