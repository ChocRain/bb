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
        createExceptionClass: function (name) {
            // FIXME: Doesn't give proper file + line in all browsers.

            var Exception = function (msg) {
                if (_.isFunction(Error.captureStackTrace)) {
                    Error.captureStackTrace(this, this.constructor);
                }
                this.name = name;
                this.message = msg;
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

            return Exception;
        }
    };
});
