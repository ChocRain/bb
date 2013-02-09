/**
 * Singleton model holding the user session.
 */
define([
    "models/BaseModel",
    "utils/clientMessageSink"
], function (
    BaseModel,
    messageSink
) {
    "use strict";

    var UserSessionModel = BaseModel.extend({
        initalize: function (attrs, opts) {
            attrs = attrs || {};
            attrs.loggedIn = !!attrs.loggedIn || false;

            BaseModel.prototype.call(this, attrs, opts);
        },

        setLoggedIn: function (loggedIn) {
            this.set("loggedIn", !!loggedIn);
        },

        isLoggedIn: function () {
            return this.get("loggedIn");
        },

        doLogin: function (assertion) {
            messageSink.sendLogin(assertion);
        },

        doRegister: function (nick, assertion) {
            messageSink.sendRegister(nick, assertion);
        }
    });

    return new UserSessionModel();
});

