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
    "shared/exceptions/ValidationException",
    "utils/fullscreen"
], function (
    _,
    userSession,
    roles,
    stringUtil,
    chatLogCollection,
    clientMessageSink,
    IllegalArgumentException,
    ValidationException,
    fullscreen
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
    var tRule = "rule";
    var tStatus = "status";


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

    var addCompletions = function (description, completions) {
        _.each(completions, function (values, type) {
            description = description.replace(new RegExp("\\${" + type + "}", "g"), values.join(", "));
        });

        return description;
    };

    var help = function (completions) {
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

            var descriptionLines = stringUtil.toWrappedLines(
                addCompletions(commandOutput.description, completions),
                allowedDescriptionLength
            );
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

    var callback = function (fun) {
        return function () {
            // ignore the available completions map
            fun.apply(this, Array.prototype.slice.call(arguments, 1));
        };
    };

    commands.push({
        name: "help",
        argTypes: [],
        callback: help,
        description: "Show this help.",
        roles: [roles.USER, roles.MODERATOR]
    });

    commands.push({
        name: "rule",
        argTypes: [tRule, tNick],
        callback: callback(function (rule, nick) {
            try {
                clientMessageSink.sendRule(rule, nick);
            } catch (err) {
                if (err instanceof ValidationException) {
                    _.each(err.getValidationResult().invalid, function (param) {
                        error("Invalid parameter: " + param);
                    });
                } else {
                    throw err;
                }
            }
        }),
        description:
                "Remind the user of the specified rule. " +
                    "This will first show a dialog informing the user you want " +
                    "him to read the rule and then open the rule in a new window. " +
                    "The user will stay logged in. <rule> may be one of: ${rule}",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "rules",
        argTypes: [tNick],
        callback: callback(function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendRules);
        }),
        description:
                "Remind the user of the rules. " +
                    "This will first show a dialog informing the user you want " +
                    "him to read the rules and then open the rules in a new window. " +
                    "The user will stay logged in.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "kick",
        argTypes: [tNick],
        callback: callback(function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendKick);
        }),
        description: "Kick the user with the specified nick.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "ban",
        argTypes: [tNick],
        callback: callback(function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendBan);
        }),
        description: "Ban the user with the specified nick forever.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "unban",
        argTypes: [tNick],
        callback: callback(function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendUnban);
        }),
        description: "Unban the user with the specified nick.",
        roles: [roles.MODERATOR]
    });

    commands.push({
        name: "status",
        argTypes: [tStatus],
        callback: callback(function (userStatus) {
            clientMessageSink.sendUpdateStatus(userStatus);
        }),
        description: "Update your status. <status> may be one of: ${status}",
        roles: [roles.USER, roles.MODERATOR]
    });

    commands.push({
        name: "ignore",
        argTypes: [tNick],
        callback: callback(function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendIgnore);
        }),
        description: "Ingore the user with the given nick temporarily.",
        roles: [roles.USER, roles.MODERATOR]
    });

    commands.push({
        name: "unignore",
        argTypes: [tNick],
        callback: callback(function (nick) {
            handleInvalidNick(nick, clientMessageSink.sendUnignore);
        }),
        description: "Stop ingoring the user with the given nick.",
        roles: [roles.USER, roles.MODERATOR]
    });

    if (fullscreen.isSupported) {
        commands.push({
            name: "fullscreen",
            argTypes: [],
            callback: callback(function () {
                fullscreen.toggle();
            }),
            description: "Toggle fullscreen mode.",
            roles: [roles.USER, roles.MODERATOR]
        });
    }

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

        exec: function (commandStr, completions) {
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

            command.callback.apply(this, [completions].concat(args));
        }
    };
});

