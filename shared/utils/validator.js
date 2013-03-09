/**
 * Validation util.
 */
define([
    "underscore",
    "shared/definitions/constraints",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/ValidationException"
], function (
    _,
    constraints,
    IllegalArgumentException,
    ValidationException
) {
    "use strict";

    var doValidate = null;
    var isValid = function (constraintsName, valueConstraints, value) {
        return _.every(valueConstraints, function (constraint, type) {
            switch (type) {

            case "type":
                return constraint === typeof value;

            case "object":
                try {
                    doValidate(constraintsName, constraint, value);
                    return true;
                } catch (err) {
                    if (err instanceof ValidationException) {
                        return false;
                    }
                    throw err;
                }
                break;

            case "minLength":
                return value.length >= constraint;

            case "maxLength":
                return value.length <= constraint;

            case "regexp":
                return new RegExp(constraint).test(value);
            }

            throw new IllegalArgumentException("Unknown constraint type: " + type);
        });
    };

    doValidate = function (constraintsName, objectConstraints, object) {
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
            } else if (!isValid(constraintsName, objectConstraints[key], value)) {
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
    };

    return {
        validate: function (constraintsName, object) {
            var objectConstraints = constraints[constraintsName];

            if (!_.isObject(objectConstraints)) {
                throw new IllegalArgumentException("Cannot find valid constraints: " + constraintsName);
            }

            doValidate(constraintsName, objectConstraints, object);
        },

        getConstraints: function (constraintsName) {
            var objectConstraints = constraints[constraintsName];

            if (!_.isObject(objectConstraints)) {
                throw new IllegalArgumentException("Cannot find valid constraints: " + constraintsName);
            }

            return objectConstraints;
        },

        isValid: function (valueConstraints, value) {
            return isValid("<unknown>", valueConstraints, value);
        }
    };
});

