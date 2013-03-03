/**
 * The root router.
 */
define([
    "underscore",
    "jquery",
    "routes/BaseRouter",
    "models/userSession",
    "views/LoginView",
    "routes/rootNavigator",
    "utils/clientMessageSink"
], function (
    _,
    $,
    BaseRouter,
    userSession,
    LoginView,
    rootNavigator,
    messageSink
) {
    "use strict";

    var RootRouter = BaseRouter.extend({
        routes: {
            "login": "login",
            "login/*redirect": "login",
            "rules": "rules",
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
        },

        rules: function () {
            // TODO: Show rules
            this.login();
        }
    });

    return RootRouter;
});

