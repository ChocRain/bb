/**
 * Module providing reading access to configuration / settings.
 */
define([
    "_nodejs"
], function (
    _nodejs
) {
    "use strict";

    // general
    var isProduction = process.env.NODE_ENV === "production";

    // paths
    var rootDirectory = _nodejs.rootDirectory;

    // basic auth
    var user = process.env.BASIC_AUTH_USER || null;
    var password = process.env.BASIC_AUTH_PASSWORD || null;
    var isBasicAuthEnabled = user && password;

    return {
        isProduction: isProduction,
        isDevelopment: !isProduction,

        paths: {
            root: rootDirectory,

            htdocs: rootDirectory + "/htdocs",
            client: rootDirectory + "/client",
            shared: rootDirectory + "/shared"
        },

        http: {
            port: process.env.PORT || 8080,
            user: isBasicAuthEnabled ? user : null,
            password: isBasicAuthEnabled ? password : null,
            isBasicAuthEnabled: isBasicAuthEnabled
        }
    };
});

