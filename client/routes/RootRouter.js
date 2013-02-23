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
    "utils/clientMessageSink",
    "scenes/roomScene"
], function (
    _,
    $,
    BaseRouter,
    userSession,
    ChatView,
    LoginView,
    rootNavigator,
    messageSink,
    roomScene
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

        _showView: function (view) {
            $("#ui").html(view.render().el);
        },

        root: function () {
            messageSink.sendGetRooms();
            roomScene.run();
            this._showView(new ChatView({model: userSession}));
        },

        login: function (redirect) {
            rootNavigator.setRedirectAfterLogin(redirect);
            if (userSession.isLoggedIn()) {
                rootNavigator.redirectAfterLogin();
            } else {
                this._showView(new LoginView({
                    model: userSession,
                    redirect: redirect
                }));
            }
        }
    });

    return RootRouter;
});

