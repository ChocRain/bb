/**
 * Base class for collections.
 */
define([
    "underscore",
    "backbone"
], function (
    _,
    Backbone
) {
    "use strict";

    var BaseCollection = Backbone.Collection.extend({
        initialize: function (models, opts) {
            Backbone.Collection.prototype.initialize.call(
                this,
                this.parse(models),
                opts
            );
        },

        add: function (models, opts) {
            Backbone.Collection.prototype.add.call(
                this,
                this.parse(models),
                opts
            );
        },

        reset: function (models, opts) {
            Backbone.Collection.prototype.reset.call(
                this,
                this.parse(models),
                opts
            );
        },

        parse: function (models) {
            if (_.isNull(models) || _.isUndefined(models)) {
                return [];
            }

            if (!_.isArray(models)) {
                models = [models];
            }

            return Backbone.Collection.prototype.parse.call(
                this,
                _.map(models, this.model.prototype.parse.bind(this))
            );
        }
    });

    return BaseCollection;
});
