/**
 * The crafty scene for the room.
 */
define([
    "underscore",
    "jquery",
    "crafty",
    "utils/asset",
    "collections/chatRoomUsersCollection",
    "models/userSession",
    "json!definitions/avatars.json"
], function (
    _,
    $,
    Crafty,
    asset,
    chatRoomUsersCollection,
    userSession,
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
                var spriteName = "pinkie_pie_dancing";
                var sprite = avatars.sprites[spriteName];

                this.requires("2D, HTML, DOM, Tween, SpriteAnimation, " + spriteName);
                this.bind("Moved", this._moved.bind(this));
                this.direction = "right";

                this.animate("anim", 0, sprite.row, sprite.frames - 1);
                this.animate("anim", Crafty.timer.getFPS() * sprite.frames * sprite.frameDelay / 1000 * 0.8, -1);
                this.crop(0, 0, sprite.width, sprite.height);
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
                this.multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});

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

        var createEntityWithNick = function (entityName, x, y, nick) {
            var entity = Crafty.e(entityName);
            entity.attr({x: x, y: y});

            var nickEntity = Crafty.e("2D, DOM, HTML");
            nickEntity.replace("<div class=\"avatar-nick\">" + nick + "</div>");
            nickEntity.attr({x: x + entity.w / 2, y: y + entity.h + 5});

            entity.attach(nickEntity);

            return entity;
        };

        var player = createEntityWithNick("Player", 400, 400, userSession.getUser().getNick());

        // TODO: This is not a very nice handling.
        // TODO: Initial positioning.
        // TODO: Nicks.
        var prevPosition = {};
        var updatePosition = function () {
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
                userSession.setPosition(position);
            }

            prevPosition = position;
            _.delay(updatePosition, 100);
        };
        _.delay(updatePosition, 100);

        var others = {};

        var addOtherUser = function (userModel) {
            var nick = userModel.getNick();

            if (userSession.getUser().getNick() === nick) {
                return;
            }

            userModel.on("change", function () {
                var position = userModel.getPosition();
                others[nick].moveTo(position.x, position.y, position.direction);
            });

            var position = userModel.getPosition();
            others[nick] = createEntityWithNick("Avatar", position.x, position.y, nick);
        };

        var removeOtherUser = function (userModel) {
            var nick = userModel.getNick();

            if (userSession.getUser().getNick() === nick) {
                return;
            }

            others[nick].destroy();
        };

        var resetOtherUsers = function () {
            _.each(others, function (entity) {
                entity.destroy();
            });
            others = {};
            chatRoomUsersCollection.each(addOtherUser);
        };

        chatRoomUsersCollection.on("add", addOtherUser);
        chatRoomUsersCollection.on("remove", removeOtherUser);
        chatRoomUsersCollection.on("reset", resetOtherUsers);

        chatRoomUsersCollection.each(addOtherUser);
    };
    var destroyScene = function () {
        running = false;
    };

    Crafty.scene(sceneName, initScene, destroyScene);
    return {
        run: function () {
            Crafty.load([roomBgImage, avatarsImage], function () {
                Crafty.scene(sceneName);
            });
        }
    };
});

