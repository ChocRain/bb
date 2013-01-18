/**
 * View for loggin in.
 */
define([
    "views/BaseView",
    "text!templates/LoginView.html"
], function (
    BaseView,
    Template
) {
    "use strict";

    var LoginView = BaseView.extend({
        className: "login-view view",
        template: Template,

        events: {
            "submit form": "handleLogin"
        },

        handleLogin: function (e) {
            if (e) {
                e.preventDefault();
            }

            // TODO: More general solution.
            // TODO: Validation.
            var $nick = this.$("form input[name=nick]");

            var nick = $nick.val();
            this.model.doLogin(nick);
            $nick.val("");
        }
    });

    return LoginView;
});

