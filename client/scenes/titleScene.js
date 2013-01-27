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

    var candyTileMap = asset.asset("/img/sprites/candy.png");

    Crafty.scene("title", function () {
        var spriteSize = 100;
        var map = {
            lollipop1: [0, 0],
            lollipop2: [0, 1],
            lollipop3: [0, 2],
            lollipop4: [0, 3],
            bonbon1: [1, 0],
            bonbon2: [1, 1],
            bonbon3: [1, 2],
            bonbon4: [1, 3]
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

        var newCandy = function () {
            var component = spriteComponents[s];
            Crafty.e("2D, DOM, Gravity, Falling, " + component).bind("Remove", function () {
                _.delay(newCandy, _.random(100, 200));
            });

            s = (s + 1) % spriteComponents.length;
        };

        var i = 0;

        var createInitialCandy = function () {
            if (i >= 24) {
                return;
            }
            i += 1;

            newCandy();
            _.delay(createInitialCandy, _.random(100, 200));
        };

        createInitialCandy();
    });

    return {
        run: function () {
            Crafty.load([candyTileMap], function () {
                Crafty.scene("title");
            });
        }
    };
});

