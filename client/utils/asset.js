/**
 * Util for including assets.
 */
/*global window: true*/ // to invoke the _asset function defined in index.html
define([
], function (
) {
    "use strict";

    return {
        asset: window._asset
    };
});

