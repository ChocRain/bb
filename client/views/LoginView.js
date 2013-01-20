/**
 * View for loggin in.
 */
define([
    "underscore",
    "views/BaseView",
    "text!templates/LoginView.html",
    "utils/validator",
    "views/Button"
], function (
    _,
    BaseView,
    Template,
    validator,
    Button
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
            opts.viewModel.constraints = validator.getConstraints("login");

            BaseView.prototype.render.call(this, opts);
            this.$("form").append(this._enterButton.render().el);

            return this;
        },

        setEnabled: function (enabled) {
            this._enterButton.setEnabled(enabled);

            var $nick = this.$("form input[name=nick]");
            if (enabled) {
                $nick.removeAttr("disabled");
            } else {
                $nick.attr({ disabled: "disabled" });
            }
        },

        handleLogin: function (e) {
            if (e) {
                e.preventDefault();
            }

            this.setEnabled(false);

            // TODO: More general solution.
            var $nick = this.$("form input[name=nick]");
            var nick = $nick.val();

            var attrs = {
                nick: nick
            };

            var validationResult = validator.validate("login", attrs);

            if (!validationResult.hasErrors) {
                this._enterButton.setLoading(true);
                this.model.doLogin(nick);
                $nick.val("");
            } else {
                // TODO: Handle nicely
                console.log(validationResult);

                var constraints = validator.getConstraints("login");

                var errorMsg = "Invalild nick. ";
                errorMsg += "Must be at least ";
                errorMsg += constraints.nick.minlength;
                errorMsg += " and at most ";
                errorMsg += constraints.nick.maxlength;
                errorMsg += " characters long. ";
                errorMsg += "Allowed are only letters, numbers and _.";

                /*global alert: true */ // TODO: Nicer handling
                alert(errorMsg);

                this.setEnabled(true);
            }
        }
    });

    return LoginView;
});

