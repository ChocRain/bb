/**
 * Mozilla Persona single sign on.
 */
define([
    "underscore",
    "https",
    "querystring",
    "server/config",
    "shared/exceptions/FeedbackException"
], function (
    _,
    https,
    querystring,
    config,
    FeedbackException
) {
    "use strict";

    // not giving away too many information to the client
    var generalErrorMessage = "Persona login failed. Please try again later.";

    var audience = config.http.publicBaseUrl;

    var verify = function (assertion, callback) {
        var opts = {
            host: "verifier.login.persona.org",
            port: 443,
            path: "/verify",
            method: "POST",
            agent: false // Disable connection pool / keep alive. TODO: Find better way to handle this.
        };

        var req = https.request(opts, function (res) {
            if (res.statusCode !== 200) {
                throw new FeedbackException(generalErrorMessage);
            }

            var body = "";
            res.on("data", function (chunk) {
                body += chunk;
            });
            res.on("end", function () {
                var response = null;
                try {
                    response = JSON.parse(body);
                } catch (err) {
                    console.error("Cannot parse response body:", body);
                    throw new FeedbackException(generalErrorMessage);
                }

                if (!_.isObject(response)) {
                    console.error("Invalid response:", response);
                    throw new FeedbackException(generalErrorMessage);
                }

                if (response.status !== "okay") {
                    throw new FeedbackException("Persona login failed. Please try again.");
                }

                var email = response.email;

                if (!_.isString(email)) {
                    console.error("Got no email in response:", response);
                    throw new FeedbackException(generalErrorMessage);
                }

                callback(email);
            });
        });

        req.on("error", function (err) {
            console.error("error:", err);
        });

        var postData = JSON.stringify({
            assertion: assertion,
            audience: audience
        });

        req.setHeader("Content-Type", "application/json");
        req.setHeader("Content-Length", postData.length);
        req.write(postData);
        req.end();
    };

    return {
        verify: verify
    };
});

