/**
 * Exception to use when the feedback should be given back to the user.
 */
define([
    "shared/utils/exceptionUtil"
], function (
    exceptionUtil
) {
    "use strict";

    return exceptionUtil.createExceptionClass("FeedbackException");
});

