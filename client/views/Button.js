/**
 * View for a button.
 */
define([
    "underscore",
    "views/BaseView",
    "utils/spinner",
    "shared/exceptions/IllegalArgumentException"
], function (
    _,
    BaseView,
    spinner,
    IllegalArgumentException
) {
    "use strict";

    var Button = BaseView.extend({
        tagName: "button",
        className: "button",
        template: "", // nothing to render

        _spinner: null,

        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            if (!_.isObject(opts) || !_.isString(opts.caption)) {
                throw new IllegalArgumentException("Button not properly initialized.");
            }

            this._caption = opts.caption;

            if (opts.attrs && !_.isObject(opts.attrs)) {
                throw new IllegalArgumentException("Attributes object must be an object.");
            }

            this._attrs = opts.attrs;
        },

        render: function (opts) {
            BaseView.prototype.render.call(this, opts);

            if (this._attrs) {
                this.$el.attr(this._attrs);
            }
            this.$el.text(this._caption);

            return this;
        },

        _setEnabled: function (enabled) {
            this.$el.toggleClass("disabled", !enabled);

            if (enabled) {
                this.$el.removeAttr("disabled");
            } else {
                this.$el.attr({ disabled: "disabled" });
            }
        },

        setLoading: function (loading) {
            this.$el.toggleClass("loading", loading);
            if (loading) {
                this._setEnabled(false);

                if (!this._spinner) {
                    this._spinner = spinner.createSmall();
                }

                this.$el.append(this._spinner.spin().el);
            } else {
                this.$el.text(this._caption);
                this._spinner.stop();
                this._setEnabled(true);
            }
        }
    });

    return Button;
});

