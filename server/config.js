/**
 * Module providing reading access to configuration / settings.
 */
define([
    "_nodejs"
], function (
    _nodejs
) {
    "use strict";

    console.log(process.env);

    // general
    var isProduction = process.env.NODE_ENV === "production";

    // paths
    var rootDirectory = _nodejs.rootDirectory;

    // basic auth
    var user = process.env.BASIC_AUTH_USER || null;
    var password = process.env.BASIC_AUTH_PASSWORD || null;
    var isBasicAuthEnabled = user && password;

    // http
    var port = process.env.PORT || 8080;
    var protocol = process.env.PROTOCOL || "http";
    var publicHostname = process.env.PUBLIC_HOSTNAME || "localhost";
    var publicPort = process.env.PUBLIC_PORT || port;

    var publicBaseUrl = protocol + "://" + publicHostname;
    if (!((publicPort === "80" && protocol === "http") ||
        (publicPort === "443" && protocol === "https"))) {
        publicBaseUrl += ":" + publicPort;
    }

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
            publicHostname: publicHostname,
            publicPort: publicPort,
            publicBaseUrl: publicBaseUrl,
            protocol: protocol,
            port: port,
            user: isBasicAuthEnabled ? user : null,
            password: isBasicAuthEnabled ? password : null,
            isBasicAuthEnabled: isBasicAuthEnabled
        }
    };
});

