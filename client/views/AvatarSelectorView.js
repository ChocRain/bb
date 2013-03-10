/**
 * View for selecting a different avatar.
 */
define([
    "views/ListView",
    "views/AvatarView",
    "collections/avatarsCollection"
], function (
    ListView,
    AvatarView,
    avatarsCollection
) {
    "use strict";

    var AvatarSelectorView = ListView.extend({
        className: "avatar-selector-view view",
        collection: avatarsCollection,

        createItemView: function (model) {
            return new AvatarView({model: model});
        }
    });

    return AvatarSelectorView;
});

