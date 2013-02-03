/**
 * Error with the message protocol (e. g. an invalid / unexpected message).
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("ProtocolException");
});

