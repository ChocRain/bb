/**
 * The root router.
 */
define([
    "jquery",
    "backbone",
    "models/userSession",
    "views/ChatView",
    "views/LoginView",
    "routes/rootNavigator"
], function (
    $,
    Backbone,
    userSession,
    ChatView,
    LoginView,
    rootNavigator
) {
    var RootRouter = Backbone.Router.extend({
        routes: {
            "": "root",
            "login": "login"
        },

        defaultRoot: function () {
            console.log("default route");

            this.root();
        },

        root: function () {
            if (userSession.isLoggedIn()) {
                // TODO: Nicer handling of views
                $("#ui").html(new ChatView({model: userSession}).render().el);
            }
            else {
                rootNavigator.login().go();
            }
        },

        login: function () {
            if (userSession.isLoggedIn()) {
                rootNavigator.root().go();
            }
            else {
                // TODO: Nicer handling of views
                $("#ui").html(new LoginView({model: userSession}).render().el);
            }
        }
    });

    return RootRouter;
});
