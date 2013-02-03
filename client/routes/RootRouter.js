/**
 * The root router.
 */
define([
    "underscore",
    "jquery",
    "routes/BaseRouter",
    "models/userSession",
    "views/ChatView",
    "views/LoginView",
    "routes/rootNavigator",
    "utils/clientMessageSink"
], function (
    _,
    $,
    BaseRouter,
    userSession,
    ChatView,
    LoginView,
    rootNavigator,
    messageSink
) {
    "use strict";

    var RootRouter = BaseRouter.extend({
        routes: {
            "login": "login",
            "login/*redirect": "login",
            "*path": "fallback"
        },

        loggedInRoutes: {
            "": "root"
        },

        loginRoute: rootNavigator.login.bind(rootNavigator),

        fallback: function (path) {
            console.log("fallback route:", path);

            rootNavigator.root().go();
        },

        root: function () {
            messageSink.sendGetRooms();

            // TODO: Nicer handling of views
            $("#ui").html(new ChatView({model: userSession}).render().el);
        },

        login: function (redirect) {
            rootNavigator.setRedirectAfterLogin(redirect);
            if (userSession.isLoggedIn()) {
                rootNavigator.redirectAfterLogin();
            } else {
                // TODO: Nicer handling of views
                $("#ui").html(new LoginView({
                    model: userSession,
                    redirect: redirect
                }).render().el);
            }
        }
    });

    return RootRouter;
});
