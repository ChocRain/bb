/**
 * A collection of members in the chat room. For now a singleton since we only
 * have one chat room.
 */
define([
    "underscore",
    "collections/BaseCollection",
    "models/AvatarModel",
    "json!shared/definitions/avatars.json"
], function (
    _,
    BaseCollection,
    AvatarModel,
    avatars
) {
    "use strict";

    var AvatarsCollection = BaseCollection.extend({
        model: AvatarModel,

        parse: function (json) {
            if (!json) {
                return [];
            }

            return BaseCollection.prototype.parse.call(this, _.pairs(json));
        }
    });

    return new AvatarsCollection(avatars.sprites);
});

