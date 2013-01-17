/**
 * The root router.
 */
define([
    "backbone"
], function (
    Backbone
) {
    var RootRouter = Backbone.Router.extend({
        routes: {
            "": "root"
        },

        root: function () {
            console.log("root");
        }
    });

    return RootRouter;
});
