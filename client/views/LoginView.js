/**
 * View for loggin in.
 */
define([
    "underscore",
    "views/BaseView",
    "text!templates/LoginView.html",
    "shared/utils/validator",
    "views/Button",
    "shared/exceptions/ValidationException"
], function (
    _,
    BaseView,
    Template,
    validator,
    Button,
    ValidationException
) {
    "use strict";

    var LoginView = BaseView.extend({
        className: "login-view view",
        template: Template,

        initialFocus: "input[name=nick]",

        events: {
            "submit form": "handleLogin"
        },

        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            this._enterButton = new Button({
                caption: "Enter",
                attrs: {
                    type: "submit"
                }
            });
        },

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.constraints = validator.getConstraints("client.user.login");

            BaseView.prototype.render.call(this, opts);
            this.$("form").append(this._enterButton.render().el);

            return this;
        },

        setLoading: function (loading) {
            this._enterButton.setLoading(loading);

            var $nick = this.$("form input[name=nick]");
            if (loading) {
                $nick.attr({ disabled: "disabled" });
            } else {
                $nick.removeAttr("disabled");
            }
        },

        handleLogin: function (e) {
            if (e) {
                e.preventDefault();
            }

            this.setLoading(true);

            // TODO: More general solution.
            var $nick = this.$("form input[name=nick]");
            var nick = $nick.val();

            try {
                this.model.doLogin(nick);
                $nick.val("");
            } catch (err) {
                if (err instanceof ValidationException) {
                    this.setLoading(false);

                    var constraints = validator.getConstraints("client.user.login");

                    var errorMsg = "Invalild nick. ";
                    errorMsg += "Must be at least ";
                    errorMsg += constraints.nick.minlength;
                    errorMsg += " and at most ";
                    errorMsg += constraints.nick.maxlength;
                    errorMsg += " characters long. ";
                    errorMsg += "Allowed are only letters, numbers and _.";

                    /*global alert: true */ // TODO: Nicer handling
                    alert(errorMsg);
                } else {
                    // re-throw any unhandled exception
                    throw err;
                }
            }
        }
    });

    return LoginView;
});

