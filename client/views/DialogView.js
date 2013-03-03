/**
 * A modal dialog.
 */
define([
    "underscore",
    "jquery",
    "views/BaseView",
    "text!templates/DialogView.html",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    $,
    BaseView,
    Template,
    IllegalArgumentException
) {
    "use strict";

    var DialogView = BaseView.extend({
        className: "dialog-view view",
        template: Template,

        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            if (!_.isString(opts.title)) {
                throw new IllegalArgumentException("DialogView expects a title string.");
            }

            if (!_.isString(opts.message)) {
                throw new IllegalArgumentException("DialogView expects a message string.");
            }

            if (!_.isString(opts.buttonLabel)) {
                throw new IllegalArgumentException("DialogView expects a buttonLabel string.");
            }

            if (opts.confirmCallback && !_.isFunction(opts.confirmCallback)) {
                throw new IllegalArgumentException("If given confirmCallback must be a function.");
            }

            this._title = opts.title;
            this._message = opts.message;
            this._buttonLabel = opts.buttonLabel;

            this._confirmCallback = opts.confirmCallback;
        },

        events: {
            "click .confirm": "doConfirm"
        },

        render: function (opts) {
            opts = opts || {};
            opts.viewModel = opts.viewModel || {};
            opts.viewModel.title = this._title;
            opts.viewModel.message = this._message;
            opts.viewModel.buttonLabel = this._buttonLabel;

            BaseView.prototype.render.call(this, opts);
            return this;
        },

        showModal: function () {
            this.render();

            var $modal = $("#modal");
            $modal.html($("<div class=\"modal-overlay\"></div>"));
            $modal.append(this.el);
        },

        closeModal: function () {
            var $modal = $("#modal");
            $modal.empty();
        },

        doConfirm: function () {
            this.closeModal();

            if (this._confirmCallback) {
                this._confirmCallback();
            }
        }
    });

    return DialogView;
});

