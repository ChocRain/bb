/**
 * The crafty scene for the room.
 */
define([
    "underscore",
    "jquery",
    "crafty",
    "utils/asset",
    "collections/chatRoomMembersCollection",
    "models/userSession",
    "shared/models/roles",
    "utils/clientMessageSink",
    "json!shared/definitions/avatars.json"
], function (
    _,
    $,
    Crafty,
    asset,
    chatRoomMembersCollection,
    userSession,
    roles,
    messageSink,
    avatars
) {
    "use strict";

    // TODO: Clean up this mess...

    var roomBgImage = asset.asset("/img/backgrounds/madam_pinkies_tent.jpg");
    var avatarsImage = asset.asset("/img/sprites/avatars.png");

    var sceneName = "room";
    var running = false;
    var initScene = function () {
        running = true;
        Crafty.background("url(" + roomBgImage + ") no-repeat");

        var spriteMap = {};
        _.each(avatars.sprites, function (sprite, name) {
            spriteMap[name] = [0, sprite.row];
        }.bind(this));

        Crafty.sprite(avatars.tileWidth, avatars.tileHeight, avatarsImage, spriteMap);

        Crafty.c("Avatar", {
            init: function () {
                this.requires("2D, HTML, DOM, Tween, SpriteAnimation");
                this.bind("Moved", this._moved.bind(this));
                this.direction = "right";
            },

            avatar: function (spriteName) {
                if (spriteName === this.spriteName) {
                    return;
                }

                this.spriteName = spriteName;
                var sprite = avatars.sprites[spriteName];

                this.requires(spriteName);

                this.stop();
                this.animate("anim", 0, sprite.row, sprite.frames - 1);
                this.animate("anim", Crafty.timer.getFPS() * sprite.frames * sprite.frameDelay / 1000 * 0.8, -1);

                var offsetY = (avatars.tileHeight - sprite.height) / 2;
                this.crop(0, offsetY, avatars.tileWidth, sprite.height + offsetY);
            },

            _moved: function (e) {
                // ensure player is facing into right direction
                var dx = this.x - e.x;
                this.updateDirection(dx);
            },

            updateDirection: function (direction) {
                if (_.isNumber(direction)) {
                    if (direction < 0) {
                        this.direction = "left";
                    } else if (direction > 0) {
                        this.direction = "right";
                    }
                } else {
                    this.direction = direction;
                }

                if (this.direction === "left") {
                    this.flip();
                } else {
                    this.unflip();
                }
            },

            moveTo: function (newX, newY, opt_direction) {
                // ensure facing right direction
                this.updateDirection(opt_direction || newX - this.x);

                // do the movement
                this.tween({x: newX, y: newY}, 10);
            }
        });

        Crafty.c("Player", {
            init: function () {
                this.requires("Avatar, Multiway");
                // FIXME: Keyboard movement is disabled due to a bug for now.
                // this.multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});

                // move player to clicked position
                $(Crafty.stage.elem).click(this._moveOnClick.bind(this));
            },

            _moveOnClick: function (e) {
                // center of sprite should be at clicked position
                var newX = e.pageX - this.w / 2;
                var newY = e.pageY - this.h / 2;

                this.moveTo(newX, newY);
            }
        });

        var createEntityWithNick = function (entityName, position, avatar, user) {
            var entity = Crafty.e(entityName);
            entity.attr({x: position.x, y: position.y});
            entity.updateDirection(position.direction);
            entity.avatar(avatar);

            var nickEntity = Crafty.e("2D, DOM, HTML");
            var classes = "avatar-nick";

            if (user.getRole().getName() === roles.MODERATOR.getName()) {
                classes += " moderator";
            }

            nickEntity.replace("<div class=\"" + classes + "\">" + user.getNick() + "</div>");
            nickEntity.attr({x: position.x + entity.w / 2, y: position.y + entity.h + 5});

            entity.attach(nickEntity);

            return entity;
        };

        var memberModel = chatRoomMembersCollection.get(userSession.getUser().getNick());
        var prevPosition = memberModel.getPosition();
        var prevAvatar = memberModel.getAvatar();
        var player = createEntityWithNick("Player", prevPosition, prevAvatar, userSession.getUser());

        memberModel.bind("change", function () {
            player.avatar(memberModel.getAvatar());
        });

        // TODO: This is not a very nice handling.
        var updatePlayer = function () {
            if (!running) {
                return; // scene isn't running anymore, don't update
            }

            var position = {
                x: player.x,
                y: player.y,
                direction: player.direction
            };

            if (position.x !== prevPosition.x
                    || position.y !== prevPosition.y
                    || position.direction !== prevPosition.direction) {
                memberModel.setPosition(position);
                messageSink.sendMoved(position);
            }

            var avatar = player.spriteName;

            if (avatar !== prevAvatar) {
                memberModel.setAvatar(avatar);
                messageSink.sendAvatarChanged(avatar);
            }

            prevPosition = position;
            prevAvatar = avatar;

            _.delay(updatePlayer, 100);
        };
        _.delay(updatePlayer, 100);

        var others = {};

        var addOtherMember = function (memberModel) {
            var nick = memberModel.getNick();

            if (userSession.getUser().getNick() === nick) {
                return;
            }

            memberModel.on("change", function () {
                var entity = others[nick];

                var avatar = memberModel.getAvatar();
                entity.avatar(avatar);

                var position = memberModel.getPosition();
                entity.moveTo(position.x, position.y, position.direction);
            });

            var position = memberModel.getPosition();
            var avatar = memberModel.getAvatar();
            others[nick] = createEntityWithNick(
                "Avatar",
                position,
                avatar,
                memberModel.getUser()
            );
        };

        var removeOtherMember = function (memberModel) {
            var nick = memberModel.getNick();

            if (userSession.getUser().getNick() === nick) {
                return;
            }

            others[nick].destroy();
        };

        var resetOtherMembers = function () {
            _.each(others, function (entity) {
                entity.destroy();
            });
            others = {};
            chatRoomMembersCollection.each(addOtherMember);
        };

        chatRoomMembersCollection.on("add", addOtherMember);
        chatRoomMembersCollection.on("remove", removeOtherMember);
        chatRoomMembersCollection.on("reset", resetOtherMembers);

        chatRoomMembersCollection.each(addOtherMember);
    };
    var destroyScene = function () {
        running = false;
    };

    Crafty.scene(sceneName, initScene, destroyScene);
    return {
        run: function (roomName) {
            Crafty.load([roomBgImage, avatarsImage], function () {
                Crafty.scene(sceneName);
            });
        }
    };
});

