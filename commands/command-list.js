const commandList = require("../data/command-list.json");
const format = require("../common/format");

module.exports = {
  name: "!commands",
  description: "Command list - returns a list of available commands",
  execute(msg, args) {
    let commandListHeader = format.bold("Command List");
    let commandListString = "";

    addCommand = (cmd, description) => {
      commandListString =
        commandListString + "\n\n" + cmd + ":\n" + description;
    };

    if (args[0] !== "picks" && args[0] !== "ai" && args[0] !== "2026") {
      commandList.commands.forEach((cmd) => {
        addCommand(cmd.name, cmd.description);
      });

      msg.channel.send(
        commandListHeader + format.codeBlock(commandListString, "autohotkey")
      );
    }

    if (
      args[0] !== "ai" &&
      args[0] !== "2026" &&
      commandList.pickCommands?.length > 0
    ) {
      commandListHeader = format.bold("Pick List Commands");
      commandListString = "";
      commandList.pickCommands.forEach((cmd) => {
        addCommand(cmd.name, cmd.description);
      });
      msg.channel.send(
        commandListHeader + format.codeBlock(commandListString, "autohotkey")
      );
    }

    if (commandList.aiCommands?.length > 0 && args[0] !== "2026") {
      commandListHeader = format.bold("AI Commands");
      commandListString = "";
      commandList.aiCommands.forEach((cmd) => {
        addCommand(cmd.name, cmd.description);
      });
      msg.channel.send(
        commandListHeader + format.codeBlock(commandListString, "autohotkey")
      );
    }

    if (commandList.commands2026?.length > 0 && args[0] !== "ai") {
      commandListHeader = format.bold("New for 2026 - Protect/Steal Commands");
      commandListString = "";
      commandList.commands2026.forEach((cmd) => {
        addCommand(cmd.name, cmd.description);
      });
      msg.channel.send(
        commandListHeader + format.codeBlock(commandListString, "autohotkey")
      );
    }

    msg.channel.send(
      "You can send these to me via private message too if you like."
    );
  },
};
