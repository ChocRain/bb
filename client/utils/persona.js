/**
 * Mozilla Persona single sign on.
 */
/*global navigator: true*/
define([
    "https://login.persona.org/include.js"
], function (
) {
    "use strict";

    var init = function (loginCallback, logoutCallback) {
        navigator.id.watch({
            loggedInUser: null,
            onlogin: loginCallback,
            onlogout: logoutCallback
        });
    };

    var login = function (loginCallback) {
        init(loginCallback, function () {
            console.error("Unexpected logout from Persona.");
        });
        navigator.id.request.call(navigator.id);
    };

    var logout = function (logoutCallback) {
        init(function () {
            console.error("Unexpected login from Persona.");
        }, logoutCallback);
        navigator.id.logout.call(navigator.id);
    };

    return {
        login: login,
        logout: logout
    };
});

