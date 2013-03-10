/**
 * Model representing an avatar.
 */
define([
    "underscore",
    "models/BaseModel"
], function (
    _,
    BaseModel
) {
    "use strict";

    var AvatarModel = BaseModel.extend({
        idAttribute: "name",

        parse: function (json) {
            return _.defaults(json[1], {
                name: json[0]
            });
        },

        getName: function () {
            return this.get("name");
        },

        getRow: function () {
            return this.get("row");
        }
    });

    return AvatarModel;
});

