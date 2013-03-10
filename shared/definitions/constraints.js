/**
 * Constraints for validating messages send from the client to the server.
 */
define([
], function (
) {
    "use strict";

    // for nicks and rooms
    var nameRegExp = /^([a-zA-Z0-9]+_?)*[a-zA-Z0-9]+$/;

    var nameConstraints = {
        type: "string",
        minLength: 3,
        maxLength: 20,
        regexp: nameRegExp
    };

    var nickConstraints = nameConstraints;
    var roomConstraints = nameConstraints;
    var ruleConstraints = nameConstraints;


    // persona assertions
    var assertionConstraints = {
        type: "string",
        minLength: 1,
        maxLength: 3000
    };


    var constraints = {
        /*
         * moderation
         */
        "client.moderation.rule": {
            rule: ruleConstraints,
            nick: nickConstraints
        },

        "client.moderation.rules": {
            nick: nickConstraints
        },

        "client.moderation.kick": {
            nick: nickConstraints
        },

        "client.moderation.ban": {
            nick: nickConstraints
        },

        "client.moderation.unban": {
            nick: nickConstraints
        },


        /*
         * user
         */
        "client.user.login": {
            assertion: assertionConstraints
        },

        "client.user.logout": {
        },

        "client.user.register": {
            assertion: assertionConstraints,
            nick: nickConstraints
        },

        "client.user.ignore": {
            nick: nickConstraints
        },

        "client.user.unignore": {
            nick: nickConstraints
        },

        "client.room.list": {
        },

        "client.room.join": {
            room: roomConstraints
        },

        "client.room.message": {
            room: roomConstraints,
            text: {
                type: "string",
                minLength: 1,
                maxLength: 200
            }
        },

        "client.room.move": {
            room: roomConstraints,
            position: {
                object: {
                    x: {
                        type: "number"
                    },
                    y: {
                        type: "number"
                    },
                    direction: {
                        regexp: /^(left|right)$/
                    }
                }
            }
        }
    };
    return constraints;
});

