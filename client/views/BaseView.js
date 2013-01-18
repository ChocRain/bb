/**
 * Base class for views.
 */
define([
    "underscore",
    "backbone"
], function (
    _,
    Backbone
) {
    "use strict";

    var BaseView = Backbone.View.extend({
        render: function (opts) {
            Backbone.View.prototype.render.call(this, opts);

            if (!this.template) {
                throw new Error("Cannot render view without template!");
            }

            var viewModel = {};

            if (this.model) {
                viewModel.model = _.clone(this.model.attributes);
            }

            this.$el.html(_.template(this.template, viewModel));

            return this;
        }
    });

    return BaseView;
});
