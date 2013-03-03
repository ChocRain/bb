/**
 * View for loggin in.
 */
define([
    "underscore",
    "views/BaseView",
    "text!templates/LoginView.html",
    "shared/utils/validator",
    "utils/dialog",
    "shared/exceptions/ValidationException",
    "utils/persona"
], function (
    _,
    BaseView,
    Template,
    validator,
    dialog,
    ValidationException,
    persona
) {
    "use strict";

    var registrationConstraintsName = "client.user.register";
    var registrationConstraints = validator.getConstraints(registrationConstraintsName);

    var nickSelector = "input[name=nick]";

    var LoginView = BaseView.extend({
        className: "login-view view",
        template: Template,

        initialFocus: nickSelector,

        events: {
            "click .login": "login",
            "click .register": "register"
        },

        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);
        },

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.constraints = registrationConstraints;

            BaseView.prototype.render.call(this, opts);

            var $nick = this.$(nickSelector);
            $nick.keydown(this.registerOnEnter.bind(this));

            return this;
        },

        setLoading: function (loading) {
            var $nick = this.$(nickSelector);
            if (loading) {
                $nick.attr({ disabled: "disabled" });
            } else {
                $nick.removeAttr("disabled");
            }
        },

        login: function (e) {
            if (e) {
                e.preventDefault();
            }

            this.setLoading(true);

            persona.login(function (assertion) {
                try {
                    this.model.doLogin(assertion);
                } catch (err) {
                    console.error(err);
                }
                this.setLoading(false);
            }.bind(this));
        },

        registerOnEnter: function (e) {
            if (e && e.keyCode === 13) {
                this.register(e);
            }
        },

        register: function (e) {
            if (e) {
                e.preventDefault();
            }

            this.setLoading(true);

            var $nick = this.$(nickSelector);
            var nick = $nick.val();

            if (!validator.isValid(registrationConstraints.nick, nick)) {
                this.setLoading(false);

                var errorMsg = "Invalild nick. ";
                errorMsg += "Must be at least ";
                errorMsg += registrationConstraints.nick.minlength;
                errorMsg += " and at most ";
                errorMsg += registrationConstraints.nick.maxlength;
                errorMsg += " characters long. ";
                errorMsg += "Allowed are only letters, numbers and _.";

                dialog.showMessage(errorMsg);

                return;
            }

            persona.login(function (assertion) {
                try {
                    this.model.doRegister(nick, assertion);
                    $nick.val("");
                } catch (err) {
                    console.error(err);
                }

                this.setLoading(false);
            }.bind(this));
        }
    });

    return LoginView;
});

