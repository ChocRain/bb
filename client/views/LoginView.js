/**
 * View for loggin in.
 */
define([
    "views/BaseView",
    "text!templates/LoginView.html",
    "utils/validator"
], function (
    BaseView,
    Template,
    validator
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
            var $nick = this.$("form input[name=nick]");
            var nick = $nick.val();

            var attrs = {
                nick: nick
            };

            var validationResult = validator.validate("login", attrs);

            if (!validationResult.hasErrors) {
                this.model.doLogin(nick);
                $nick.val("");
            }
            else {
                // TODO: Handle nicely
                console.log(validationResult);

                var errorMsg = "Invalild nick. "
                errorMsg += "Must be at least 3 and at most 20 characters long. ";
                errorMsg += "Allowed are only letters, numbers and _."
                alert(errorMsg);
            }
        }
    });

    return LoginView;
});

