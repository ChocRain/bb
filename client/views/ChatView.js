/**
 * View for the whole chat.
 */
define([
    "views/BaseView",
    "text!templates/ChatView.html",
    "views/ChatLogView",
    "views/ChatInputView",
    "views/ChatRoomUsersListView",
    "utils/persona",
    "models/userSession"
], function (
    BaseView,
    Template,
    ChatLogView,
    ChatInputView,
    ChatRoomUsersListView,
    persona,
    userSession
) {
    "use strict";

    var ChatView = BaseView.extend({
        className: "chat-view view",
        template: Template,

        events: {
            "click .chat-actions .logout-btn": "logout"
        },

        initialize: function (opts) {
            BaseView.prototype.initialize.call(this, opts);

            this._chatLogView = new ChatLogView();
            this._chatInputView = new ChatInputView();
            this._chatRoomUsersView = new ChatRoomUsersListView();
        },

        render: function (opts) {
            BaseView.prototype.render.call(this, opts);

            this.$(".chat-log").html(this._chatLogView.render().el);
            this.$(".chat-input").html(this._chatInputView.render().el);
            this.$(".chat-room-users").html(this._chatRoomUsersView.render().el);

            return this;
        },

        logout: function () {
            persona.logout(function () {}); // do nothing after logout
            userSession.doLogout();
        }
    });

    return ChatView;
});

