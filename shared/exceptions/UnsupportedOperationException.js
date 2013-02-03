/**
 * Exception in case an opeation is not supported on an object.
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("UnsupportedOperationException");
});

