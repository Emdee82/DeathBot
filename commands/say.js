module.exports = {
  name: "!say",
  description: "Say something on the channel provided.",
  restrictionLevel: 1,
  execute(msg, args, stateFuncs, channel) {
    channel.send(args.join(" "));
  },
};
