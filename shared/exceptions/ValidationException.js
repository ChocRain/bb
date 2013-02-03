/**
 * Exception in case a validation error occured.
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("ValidationException", ["constraintsName", "validationResult"]);
});

