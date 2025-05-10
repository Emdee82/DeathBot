const format = require("../../common/format");

module.exports = {
  name: "!ai",
  description: "Print the currently selected AI model",
  execute(msg, args, stateFuncs) {
    const state = stateFuncs.getState();
    let output = `${format.bold("Deathbot")} is currently powered by ${format.bold(state.aiModel)}`;
    msg.channel.send(output);
  },
};
