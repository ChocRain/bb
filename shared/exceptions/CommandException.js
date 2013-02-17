/**
 * Error executing a command.
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("CommandException");
});

