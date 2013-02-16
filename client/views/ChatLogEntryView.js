/**
 * View for an entry of the chat log.
 */
define([
    "underscore",
    "views/BaseView",
    "text!templates/ChatLogEntryView.html",
    "models/userSession"
], function (
    _,
    BaseView,
    Template,
    userSession
) {
    "use strict";

    var ChatLogEntryView = BaseView.extend({
        tagName: "li",
        className: "chat-log-entry-view view",
        template: Template,

        render: function (opts) {
            BaseView.prototype.render.call(this, opts);

            this.$el.toggleClass("highlight", this.isHighlight());
            this.$el.toggleClass("own", this.isOwn());

            return this;
        },

        isHighlight: function () {
            var messageType = this.model.get("type");
            if (messageType !== "message") {
                return false;
            }

            var text = this.model.get("text").toLowerCase();
            var myNick = userSession.getUser().getNick().toLowerCase();

            var candidateNicks = text.match(/[a-zA-Z0-9_]+/g);

            var matches = _.filter(candidateNicks, function (candidateNick) {
                return candidateNick.toLowerCase() === myNick;
            });

            return _.size(matches) > 0;
        },

        isOwn: function () {
            var myNick = userSession.getUser().getNick();

            var messageNick = this.model.get("nick");
            if (!messageNick) {
                var user = this.model.get("user");
                if (!user) {
                    return false;
                }

                messageNick = user.getNick();
            }

            return myNick === messageNick;
        }
    });

    return ChatLogEntryView;
});

