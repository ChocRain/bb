/**
 * Exception in case the application is in an unexpected state that may not occur.
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("IllegalStateException");
});

