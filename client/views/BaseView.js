/**
 * Base class for views.
 */
define([
    "underscore",
    "backbone",
    "moment",
    "shared/exceptions/IllegalArgumentException",
    "hacks/craftyInput"
], function (
    _,
    Backbone,
    moment,
    IllegalArgumentException,
    craftyInput
) {
    "use strict";

    var BaseView = Backbone.View.extend({
        render: function (opts) {
            Backbone.View.prototype.render.call(this, opts);

            if (!_.isString(this.template)) {
                throw new IllegalArgumentException("Cannot render view without template!");
            }

            var viewModel = opts && opts.viewModel ? opts.viewModel : {};

            if (this.model) {
                viewModel.model = _.clone(this.model.attributes);
            }

            // add renderers
            viewModel.r = {
                time: function (date) {
                    var m = moment(date);

                    if (!m.isValid()) {
                        throw new IllegalArgumentException("Invalid arguemnt for renderer time:" + date);
                    }

                    return m.format("HH:mm");
                }
            };

            this.$el.html(_.template(this.template, viewModel));

            craftyInput.applyHack(this.$("input"));

            if (this.initialFocus) {
                // Hopefully focus after view being put into DOM.
                _.defer(function () {
                    this.$(this.initialFocus).focus();
                }.bind(this));
            }

            // Prevent crafty from handling click events on views
            this.$el.click(function (e) {
                if (e) {
                    e.stopPropagation();
                }
            });

            return this;
        }
    });

    return BaseView;
});
