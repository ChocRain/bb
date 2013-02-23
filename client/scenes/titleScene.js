/**
 * The crafty scene for the title screen.
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

    var running = false;

    var candyTileMap = asset.asset("/img/sprites/candy.png");

    var sceneName = "title";
    var initScene = function () {
        running = true;

        var spriteSize = 100;
        var map = {
            lollipop1: [0, 0],
            lollipop2: [1, 0],
            lollipop3: [2, 0],
            lollipop4: [3, 0],
            bonbon1: [0, 1],
            bonbon2: [1, 1],
            bonbon3: [2, 1],
            bonbon4: [3, 1]
        };
        Crafty.sprite(spriteSize, candyTileMap, map);

        var spriteComponents = _.keys(map);

        var maxX = $("#cr-stage").width() - spriteSize;
        var minY = -1.2 * spriteSize;
        var maxY = -spriteSize;

        Crafty.c("Falling", {
            init: function () {
                this.x = _.random(0, maxX);
                this.y = _.random(minY, maxY);
                this.gravityConst(0.05);
                this.gravity();

                this.bind("EnterFrame", function () {
                    if (this.y > this._getStageHeight()) {
                        this.destroy();
                    }
                });
            },

            _getStageHeight: _.throttle(function () {
                return $("#cr-stage").height();
            }, 1000)
        });

        var s = 0;
        var n = 20;

        var newCandy = function () {
            if (!running) {
                return;
            }

            if (n > 0) {
                var component = spriteComponents[s];
                Crafty.e("2D, DOM, Gravity, Falling, " + component).bind("Remove", function () {
                    n += 1;
                });

                n -= 1;
                s = (s + 5) % spriteComponents.length;
            }

            _.delay(newCandy, _.random(200, 400));
        };

        newCandy();
    };
    var destroyScene = function () {
        running = false;
    };

    Crafty.scene(sceneName, initScene, destroyScene);

    return {
        run: function () {
            Crafty.load([candyTileMap], function () {
                Crafty.scene(sceneName);
            });
        }
    };
});

