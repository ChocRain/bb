/**
 * Helper to migrate all the collections to the newest version.
 */
define([
    "server/daos/userDao"
], function (
    userDao
) {
    "use strict";

    return {
        migrate: function (callback) {
            userDao.migrate(callback);
        }
    };
});
