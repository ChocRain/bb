/**
 * Util to help dealing with exceptions.
 */
define([
    "underscore"
], function (
    _
) {
    "use strict";

    return {
        createExceptionClass: function (name, opt_fieldNames) {
            // FIXME: Doesn't give proper file + line in all browsers.

            var Exception = function (msg) {
                if (_.isFunction(Error.captureStackTrace)) {
                    Error.captureStackTrace(this, this.constructor);
                }
                this.name = name;
                this.message = msg;

                if (opt_fieldNames) {
                    this._fields = {};
                    var fields = Array.prototype.slice.call(arguments, 1);

                    _.each(fields, function (value, index) {
                        var fieldName = opt_fieldNames[index];

                        if (_.isString(fieldName)) {
                            this._fields[fieldName] = value;
                        }
                    }, this);
                }
            };

            /*
             * 1st note that __proto__ is deprecated.
             * 2nd note that there's no substitute for writing it.
             *
             * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/proto
             *
             * Thus: Crude hack to silence jslint.
             */
            var proto = "__proto__";
            Exception.prototype[proto] = Error.prototype;

            if (opt_fieldNames) {
                // add getters for fields
                _.each(opt_fieldNames, function (fieldName) {
                    if (_.isString(fieldName)) {
                        var getterName =
                            "get" +
                            fieldName.substring(0, 1).toUpperCase() +
                            fieldName.substring(1, fieldName.length);

                        Exception.prototype[getterName] = function () {
                            return this._fields[fieldName];
                        };
                    }
                });
            }

            return Exception;
        }
    };
});
