/**
 * Exception in case a function is called with a set of unexpected arguments.
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("IllegalArgumentException");
});

