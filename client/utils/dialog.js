/**
 * Util for showing message dialogs.
 */
define([
    "underscore",
    "views/DialogView"
], function (
    _,
    DialogView
) {
    "use strict";

    var dialogOpen = false;
    var dialogQueue = [];

    var showDialog = function (opts) {
        dialogOpen = true;

        var oldCallback = opts.confirmCallback;
        // wrap callback to handle open / queued dialogs
        var wrappedCallback = function () {
            dialogOpen = false;

            if (_.isFunction(oldCallback)) {
                oldCallback();
            }

            if (dialogQueue.length > 0) {
                var newOpts = dialogQueue[0];
                dialogQueue = dialogQueue.slice(1);

                showDialog(newOpts);
            }
        };
        opts.confirmCallback = wrappedCallback;

        new DialogView(opts).showModal();
    };

    return {
        showMessage: function (title, message, buttonLabel, callback) {
            var opts = {
                title: title,
                message: message,
                buttonLabel: buttonLabel,
                confirmCallback: callback
            };

            if (dialogOpen) {
                // Queue the dialog. It will be displayed as soon as all
                // previous ones have been closed.
                dialogQueue.push(opts);
            } else {
                // only one dialog may be shown at a time
                showDialog(opts);
            }
        }
    };
});

