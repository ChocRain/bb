/**
 * Module providing reading access to configuration / settings.
 */
define([
], function (
) {
    "use strict";

    // general
    var isProduction = process.env.NODE_ENV === "production";

    // basic auth
    var user = process.env.BASIC_AUTH_USER || null;
    var password = process.env.BASIC_AUTH_PASSWORD || null;
    var isBasicAuthEnabled = user && password;

    return {
        isProduction: isProduction,
        isDevelopment: !isProduction,

        http: {
            port: process.env.PORT || 8080,
            user: isBasicAuthEnabled ? user : null,
            password: isBasicAuthEnabled ? password : null,
            isBasicAuthEnabled: isBasicAuthEnabled
        }
    };
});

