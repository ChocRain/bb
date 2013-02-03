/**
 * Base view for views rendering lists of items.
 */
define([
    "underscore",
    "views/BaseView",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/UnsupportedOperationException"
], function (
    _,
    BaseView,
    IllegalArgumentException,
    UnsupportedOperationException
) {
    "use strict";

    var ListView = BaseView.extend({
        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            if (!_.isFunction(this.createItemView)) {
                throw new IllegalArgumentException("List view is missing createItemView().");
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
            throw new UnsupportedOperationException("Unsupported opertation: remove");
        },

        reset: function () {
            throw new UnsupportedOperationException("Unsupported opertation: reset");
        }
    });

    return ListView;
});

