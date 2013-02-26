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

            this._itemViewsByClientId = {};

            if (!_.isFunction(this.createItemView)) {
                throw new IllegalArgumentException("List view is missing createItemView().");
            }

            this.collection.on("add", this.add.bind(this));
            this.collection.on("remove", this.remove.bind(this));
            this.collection.on("reset", this.reset.bind(this));
        },

        render: function (opts) {
            // Not calling BaseView.prototype.render on purpose.

            this.reset();
            return this;
        },

        add: function (model) {
            var view = this.createItemView(model);
            this.$el.append(view.render().el);
            this._itemViewsByClientId[model.cid] = view;
        },

        remove: function (model) {
            var view = this._itemViewsByClientId[model.cid];
            view.remove();
            this._itemViewsByClientId[model.cid] = undefined;
        },

        reset: function (models) {
            this._itemViewsByClientId = {};
            this.$el.empty();
            this.collection.each(this.add.bind(this));
        }
    });

    return ListView;
});

