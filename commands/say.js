module.exports = {
  name: "!say",
  description: "Say something on the channel provided.",
  restrictionLevel: 1,
  execute(channel, args) {
    channel.send(args.join(" "));
  },
};
