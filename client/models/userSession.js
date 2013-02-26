/**
 * Singleton model holding the user session.
 */
define([
    "models/BaseModel",
    "utils/clientMessageSink",
    "shared/models/PublicUser",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/IllegalStateException"
], function (
    BaseModel,
    messageSink,
    PublicUser,
    IllegalArgumentException,
    IllegalStateException
) {
    "use strict";

    var UserSessionModel = BaseModel.extend({
        initalize: function (attrs, opts) {
            attrs = attrs || {};
            attrs.loggedIn = !!attrs.loggedIn || false;

            if (attrs.user && !(attrs.user instanceof PublicUser)) {
                throw new IllegalArgumentException("User attribute is no PublicUser.");
            }

            BaseModel.prototype.call(this, attrs, opts);
        },

        setLoggedIn: function (loggedIn) {
            this.set("loggedIn", !!loggedIn);
        },

        isLoggedIn: function () {
            return this.get("loggedIn");
        },

        setUser: function (user) {
            if (!(user instanceof PublicUser)) {
                throw new IllegalArgumentException("User is no PublicUser.");
            }

            this.set("user", user);
        },

        getUser: function () {
            var user = this.get("user");

            if (!user) {
                throw new IllegalStateException("User is not set in session.");
            }

            if (!(user instanceof PublicUser)) {
                throw new IllegalStateException("Invalid user in session.");
            }

            return user;
        },

        doLogin: function (assertion) {
            messageSink.sendLogin(assertion);
        },

        doLogout: function () {
            messageSink.sendLogout();
        },

        doRegister: function (nick, assertion) {
            messageSink.sendRegister(nick, assertion);
        },

        setPosition: function (position) {
            this.getUser().setPosition(position);
            messageSink.sendMoved(position);
        }
    });

    return new UserSessionModel();
});

