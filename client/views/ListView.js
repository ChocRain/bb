/**
 * Base view for views rendering lists of items.
 */
define([
    "underscore",
    "views/BaseView"
], function (
    _,
    BaseView
) {
    "use strict";

    var ListView = BaseView.extend({
        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            if (!_.isFunction(this.createItemView)) {
                throw new Error("List view is missing createItemView().");
            }

            this.collection.on("add", this.add.bind(this));
            this.collection.on("remove", this.remove.bind(this));
            this.collection.on("reset", this.reset.bind(this));
        },

        render: function (opts) {
            this.$el.empty();
            this.collection.each(this.add.bind(this));

            return this;
        },

        add: function (model) {
            this.$el.append(this.createItemView(model).render().el);
        },

        remove: function () {
            throw new Error("Unsupported opertation: remove");
        },

        reset: function () {
            throw new Error("Unsupported opertation: reset");
        }
    });

    return ListView;
});

