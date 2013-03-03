Naming files
============

Usualy the names of JavaScript files / modules beginning with an uppercase
letter indicate a class being exported, the ones beginning with a lower case
letter indicate singleton objects, utility modules or factories. Exceptions
to this rule are usually only third party libraries.

Directory structure
===================

/avatars
    Holds the animated GIFs and a script to convert those automatically into
    a sprite map.

/bin
    Holds scripts for building / deploying the application.

/build
    Holds files created during the build. This directory shall not be commited.

/client
    Holds client only code.

/client/collections
    Holds the backbone.js collections.

/client/libs
    Third party libraries.

/client/routes
    Holds routers (for handling the routing) and navigators (for navigating to
    specific routes).

/client/scenes
    Holds crafty.js scenes.

/client/templates
    Holds underscore.js templates. Each template is named after the backbone.js
    view under /client/views to which it belongs. 

/client/utils
    Holds currently way to many modules. Ideally this should only hold stateless
    utils and basic helper classes.

/docs
    Holds the documentation.

/etc
    Config files for the build / deployment.

/htdocs
    Static files served by the webserver.

/node_modules
    Created by npm install. Holds node.js dependencies. Do not commit this.

/shared
    Holds code shared between client and server.

/shared/definitions
    Holds definitions for validation, etc.

/shared/exceptions
    Custom exceptions.

/shared/libs
    Third party libraries.

/shared/models
    General model classes (independent from backbone.js).

/shared/utils
    Holds currently way to many modules. Ideally this should only hold stateless
    utils and basic helper classes.

/server
    Holds server only code.

/server/daos
    Persistance layer. DAOs (Data Access Object) are used to store / retrieve
    data e.g. in / from database.

/server/models
    General model classes.

/server/session
    Holds session related classes.

/server/services
    Service / business layer.

/server/templates
    Holds the underscore.js template for the index.html.

/server/utils
    Holds currently way to many modules. Ideally this should only hold stateless
    utils and basic helper classes.

