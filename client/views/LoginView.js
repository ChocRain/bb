/**
 * View for loggin in.
 */
define([
    "underscore",
    "views/BaseView",
    "text!templates/LoginView.html",
    "utils/validator"
], function (
    _,
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

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.constraints = validator.getConstraints("login");

            // Hopefully focus after view being put into DOM.
            _.defer(function () {
                this.$("input[name=nick]").focus();
            }.bind(this));

            return BaseView.prototype.render.call(this, opts);
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

                var constraints = validator.getConstraints("login");

                var errorMsg = "Invalild nick. "
                errorMsg += "Must be at least ";
                errorMsg += constraints.nick.minlength;
                errorMsg += " and at most ";
                errorMsg += constraints.nick.maxlength;
                errorMsg += " characters long. ";
                errorMsg += "Allowed are only letters, numbers and _."
                alert(errorMsg);
            }
        }
    });

    return LoginView;
});

