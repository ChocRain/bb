/**
 * Commands executable by the user.
 */
define([
    "underscore",
    "models/userSession",
    "shared/models/roles",
    "utils/string",
    "collections/chatLogCollection",
    "utils/clientMessageSink",
    "shared/exceptions/IllegalArgumentException",
    "shared/exceptions/ValidationException"
], function (
    _,
    userSession,
    roles,
    stringUtil,
    chatLogCollection,
    clientMessageSink,
    IllegalArgumentException,
    ValidationException
) {
    "use strict";

    // command output

    var print = function (lines) {
        if (_.isString(lines)) {
            lines = [lines];
        }

        chatLogCollection.add({
            type: "system-out",
            lines: lines.join("\n")
        });
    };

    var error = function (lines) {
        if (_.isString(lines)) {
            lines = [lines];
        }

        chatLogCollection.add({
            type: "system-error",
            lines: lines.join("\n")
        });
    };


    // argument types

    var tNick = "nick";


    // getting help

    var commands = [];

    var getCommandOutput = function (command) {
        var commandOutput = "/" + command.name;

        _.each(command.argTypes, function (arg) {
            commandOutput += " <" + arg + ">";
        });

        return {
            command: commandOutput,
            description: command.description
        };
    };

    var usage = function (command) {
        var commandOutput = getCommandOutput(command);
        return commandOutput.command;
    };

    var hasRequiredRole = function (command, userRole) {
        var roleNames = _.map(command.roles, function (role) {
            return role.getName();
        });
        return _.contains(roleNames, userRole.getName());
    };

    var help = function () {
        var allowedLineLength = 55;
        var maxCommandOutputLength = 0;

        var userRole = userSession.getUser().getRole();
        var authorizedCommands = _.filter(commands, function (command) {
            return hasRequiredRole(command, userRole);
        });

        var commandOutputs = _.map(authorizedCommands, function (command) {
            var commandOutput = getCommandOutput(command);

            var len = commandOutput.command.length;
            if (len > maxCommandOutputLength) {
                maxCommandOutputLength = len;
            }

            return commandOutput;
        });

        var allowedDescriptionLength = allowedLineLength - maxCommandOutputLength - 2;

        var lines = _.map(commandOutputs, function (commandOutput) {
            var len = commandOutput.command.length;

            var output = commandOutput.command;
            output += stringUtil.repeat(" ", maxCommandOutputLength - len + 2);

            var descriptionLines = stringUtil.toWrappedLines(commandOutput.description, allowedDescriptionLength);
            output += descriptionLines.join("\n" + stringUtil.repeat(" ", maxCommandOutputLength + 2));

            return output;
        });

        print(lines);
    };


    // command definitions    

    var handleInvalidNick = function (nick, sendFunction) {
        try {
            sendFunction(nick);
        } catch (err) {
            if (err instanceof ValidationException) {
                error("Invalid nick: " + nick);
            } else {
                throw err;
            }
        }
    };

    commands.push({
        name: "help",
        argTypes: [],
        callback: help,
        description: "Show this help.",
        roles: [roles.USER, roles.MODERATOR]
    });

    commands.push({
        name: "rules",
        argTypes: [tNick],
        callback: function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendRules);
        },
        description:
                "Remind the user with the specified nick of the rules. " +
                    "This will first show a dialog informing the user you want " +
                    "him to read the rules and then open the rules in a new window. " +
                    "The user will stay logged in.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "kick",
        argTypes: [tNick],
        callback: function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendKick);
        },
        description: "Kick the user with the specified nick.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "ban",
        argTypes: [tNick],
        callback: function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendBan);
        },
        description: "Ban the user with the specified nick forever.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "unban",
        argTypes: [tNick],
        callback: function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendUnban);
        },
        description: "Unban the user with the specified nick.",
        roles: [roles.MODERATOR]
    });

    var commandsByName = {};
    _.each(commands, function (command) {
        commandsByName[command.name] = command;
    });

    var findCommand = function (name) {
        var command = commandsByName[name];

        if (!command) {
            return command;
        }

        // ensure user may perform this one
        var userRole = userSession.getUser().getRole();
        if (hasRequiredRole(command, userRole)) {
            return command;
        }
        return null;
    };

    var parse = function (commandStr) {
        var components = stringUtil.words(commandStr);
        var commandNameWithSlash = components[0];
        var args = components.slice(1);

        if (commandNameWithSlash.charAt(0) !== "/") {
            throw new IllegalArgumentException("Command name must start with a '/'.");
        }

        var commandName = commandNameWithSlash.substr(1);
        var command = findCommand(commandName);

        return {
            commandName: commandName,
            args: args,
            command: command
        };
    };

    return {
        isCommand: function (commandStr) {
            return commandStr.trim().charAt(0) === "/";
        },

        getCommandNames: function () {
            var userRole = userSession.getUser().getRole();
            return _.map(_.filter(commands, function (command) {
                return hasRequiredRole(command, userRole);
            }), function (command) {
                return command.name;
            });
        },

        findArgTypes: function (commandStr) {
            var command = parse(commandStr).command;
            return command ? command.argTypes : null;
        },

        exec: function (commandStr) {
            var parseResult = parse(commandStr);
            var commandName = parseResult.commandName;
            var args = parseResult.args;
            var command = parseResult.command;

            if (!command) {
                return error("Unknown command /" + commandName + ". Try /help.");
            }

            if (args.length !== command.argTypes.length) {
                return error("Wrong number of parameters. Usage: " + usage(command));
            }

            command.callback.apply(this, args);
        }
    };
});

