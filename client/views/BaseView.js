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

            this.$el.html(_.template(this.template));

            return this;
        }
    });

    return BaseView;
});
