/**
 * Base class for views.
 */
define([
    "underscore",
    "backbone",
    "moment"
], function (
    _,
    Backbone,
    moment
) {
    "use strict";

    var BaseView = Backbone.View.extend({
        render: function (opts) {
            Backbone.View.prototype.render.call(this, opts);

            if (!_.isString(this.template)) {
                throw new Error("Cannot render view without template!");
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
                        throw new Error("Invalid arguemnt for renderer time:" + date);
                    }

                    return m.format("HH:mm");
                }
            };

            this.$el.html(_.template(this.template, viewModel));

            return this;
        }
    });

    return BaseView;
});
