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
    var isEnforceHttpsEnabled = protocol === "https";

    var publicBaseUrl = protocol + "://" + publicHostname;
    if (!((publicPort === "80" && protocol === "http") ||
        (publicPort === "443" && protocol === "https"))) {
        publicBaseUrl += ":" + publicPort;
    }

    // db
    var dbHost = process.env.DB_HOST || "localhost";
    var dbPort = process.env.DB_PORT || 27017;
    var dbUser = process.env.DB_USER || null;
    var dbPassword = process.env.DB_PASSWORD || null;
    var dbName = process.env.DB_NAME || "ponyverse";

    var dbUrl = "mongodb://";
    if (dbUser && dbPassword) {
        dbUrl += dbUser + ":" + dbPassword + "@";
    }
    dbUrl += dbHost + ":" + dbPort + "/" + dbName;

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
            isBasicAuthEnabled: isBasicAuthEnabled,
            isEnforceHttpsEnabled: isEnforceHttpsEnabled
        },

        db: {
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            name: dbName,
            url: dbUrl
        },

        session: {
            replaceSessionOnRelogin: true
        }
    };
});

