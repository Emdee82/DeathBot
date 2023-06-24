const error = require("../common/error");

module.exports = {
  name: "!say",
  description: "Say something on the channel provided.",
  restrictionLevel: 1,
  execute(msg, args, stateFuncs, channel) {
    if (!args || !args[0]) {
      error.usage("!say [message content]", msg);
      return;
    }

    console.log(new Date(), `[say]: ${msg.author.username} is attempting to say`, args);
    channel.send(args.join(" "));
  },
};
