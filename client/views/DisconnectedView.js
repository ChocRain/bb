/**
 * View to inform the user he has been disconnected.
 */
define([
    "jquery",
    "views/BaseView",
    "text!templates/DisconnectedView.html",
    "routes/rootNavigator"
], function (
    $,
    BaseView,
    Template,
    rootNavigator
) {
    "use strict";

    var DisconnectedView = BaseView.extend({
        className: "disconnected-view view",
        template: Template,

        events: {
            "click .reload": "reload"
        },

        show: function () {
            // TODO: Generalize to dialog view.
            this.render();

            var $ui = $("#ui");
            $ui.append($("<div class=\"modal-overlay\"></div>"));
            $ui.append(this.el);
        },

        reload: function (e) {
            if (e) {
                e.preventDefault();
            }
            rootNavigator.reload();
        }
    });

    return DisconnectedView;
});

