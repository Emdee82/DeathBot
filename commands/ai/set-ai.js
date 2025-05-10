const format = require("../../common/format");

module.exports = (command, model) => {
    return {
        name: command,
        description: "Sets the chosen AI model",
        execute(msg, args, stateFuncs) {
            stateFuncs.updateAiModel(model);
            let output = `${format.bold("Deathbot")} is now powered by ${format.bold(model)}`;
            msg.channel.send(output);
        },
    };
};
