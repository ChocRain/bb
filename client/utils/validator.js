/**
 * Validation util.
 */
define([
    "underscore",
    "json!shared/definitions/constraints.json",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/ValidationException"
], function (
    _,
    constraints,
    IllegalArgumentException,
    ValidationException
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

            throw new IllegalArgumentException("Unknown constraint type: " + type);
        });
    };

    return {
        validate: function (constraintsName, object) {
            var objectConstraints = constraints[constraintsName];

            if (!_.isObject(objectConstraints)) {
                throw new IllegalArgumentException("Cannot find valid constraints: " + constraintsName);
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
                } else if (!isValid(objectConstraints[key], value)) {
                    invalid.push(key);
                    result.hasErrors = true;
                }
            });

            if (result.hasErrors) {
                result.missing = missing;
                result.invalid = invalid;
                result.unknown = unknown;

                throw new ValidationException(
                    "Validation error for constraints: " + constraintsName,
                    constraintsName,
                    result
                );
            }
        },

        getConstraints: function (constraintsName) {
            var objectConstraints = constraints[constraintsName];

            if (!_.isObject(objectConstraints)) {
                throw new IllegalArgumentException("Cannot find valid constraints: " + constraintsName);
            }

            return objectConstraints;
        }
    };
});

