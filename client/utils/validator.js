/**
 * Validation util.
 */
define([
    "underscore",
    "json!definitions/constraints.json"
], function (
    _,
    constraints
) {
    "use strict";

    var isValid = function (valueConstraints, value) {
        if (!_.isString(value)) {
            // TODO: Add support for other types.
            return false;
        }

        var valid = true;

        return _.every(valueConstraints, function (constraint, type) {
            switch (type) {
                case "minlength":
                    return value.length >= constraint;

                case "maxlength":
                    return value.length <= constraint;

                case "regexp":
                    return new RegExp(constraint).test(value);
            }

            throw new Error("Unknown constraint type: " + type);
        });
    };

    return {
        validate: function (constraintsName, object) {
            var objectConstraints = constraints[constraintsName];

            if (!_.isObject(objectConstraints)) {
                throw new Error("Cannot find valid constraints: " + constraintsName);
            }

            var invalid = [];
            var unknown = [];
            var missing = [];
            var result = {
                hasErrors: false
            };

            _.each(objectConstraints, function (valueConstraints, key) {
                if (object[key] === null || object[key] === undefined) {
                    missing.push(key);
                    result.hasErrors = true;
                }   
            });

            _.each(object, function (value, key) {
                if (!objectConstraints[key]) {
                    unknown.push(key);
                    result.hasErrors = true;
                }
                else if (!isValid(objectConstraints[key], value)) {
                    invalid.push(key);
                    result.hasErrors = true;
                }
            });

            result.missing = missing;
            result.invalid = invalid;
            result.unknown = unknown;

            return result;
        }
    };
});

