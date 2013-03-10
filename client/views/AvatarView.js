/**
 * View for an entry in the ChatRoomMembersListView.
 */
define([
    "views/BaseView",
    "models/userSession",
    "collections/chatRoomMembersCollection",
    "utils/asset",
    "text!templates/AvatarView.html",
    "json!shared/definitions/avatars.json"
], function (
    BaseView,
    userSession,
    chatRoomMembersCollection,
    asset,
    Template,
    avatars
) {
    "use strict";

    var avatarsImage = asset.asset("/img/sprites/avatars.png");

    var AvatarView = BaseView.extend({
        tagName: "li",
        className: "avatar-view view",
        template: Template,

        events: {
            "click": "changeAvatar"
        },

        render: function () {
            BaseView.prototype.render.apply(this, arguments);

            var scaleFactor = 0.5;

            var row = this.model.getRow();
            var x = 0;
            var y = row * 100;
            var width = avatars.maxFrames * 100;

            var $img = this.$(".avatar-selector-image");
            $img.css("width", avatars.tileWidth * scaleFactor);
            $img.css("height", avatars.tileHeight * scaleFactor);
            $img.css("background-position", x + "% " + y + "%");
            $img.css("background-image", "url(" + avatarsImage + ")");
            $img.css("background-size", width + "%");

            return this;
        },

        changeAvatar: function () {
            var avatarName = this.model.getName();
            var nick = userSession.getUser().getNick();
            var memberModel = chatRoomMembersCollection.get(nick);
            memberModel.setAvatar(avatarName);
        }
    });

    return AvatarView;
});

