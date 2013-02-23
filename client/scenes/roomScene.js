/**
 * The crafty scene for the room.
 */
define([
    "underscore",
    "jquery",
    "crafty",
    "utils/asset"
], function (
    _,
    $,
    Crafty,
    asset
) {
    "use strict";

    var roomBg = asset.asset("/img/backgrounds/ponyverse_pre_alpha.png");
    var candyTileMap = asset.asset("/img/sprites/chocolaterain.png");

    var sceneName = "room";
    var initScene = function () {
        Crafty.background("url(" + roomBg + ") no-repeat");

        var spriteSize = 100;
        var map = {
            chocolaterain: [0, 0]
        };
        Crafty.sprite(spriteSize, candyTileMap, map);

        var player = Crafty.e("2D, DOM, Multiway, Tween, chocolaterain")
            .attr({x: 400, y: 400})
            .multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});

        var ensureDirection = function (entity, dx) {
            if (dx < 0) {
                entity.flip();
            } else if (dx > 0) {
                entity.unflip();
            }
        };

        // move player to clicked position
        Crafty.addEvent(Crafty.stage.elem, "click", function (e) {
            // center of sprite should be at clicked position
            var newX = e.clientX - spriteSize / 2;
            var newY = e.clientY - spriteSize / 2;

            // ensure facing right direction
            var dx = newX - player.x;
            ensureDirection(player, dx);

            // do the movement
            player.tween({x: newX, y: newY}, 10);
        });

        // ensure player is facing into right direction
        player.bind("Moved", function (e) {
            var dx = player.x - e.x;
            ensureDirection(player, dx);
        });
    };
    var destroyScene = function () {
        // TODO: Unbind events.
    };

    Crafty.scene(sceneName, initScene, destroyScene);
    return {
        run: function () {
            Crafty.load([roomBg], function () {
                Crafty.scene(sceneName);
            });
        }
    };
});

