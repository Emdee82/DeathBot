module.exports = {
  name: "!ppt",
  description: "Say something on the channel provided.",
  execute(channel, args) {
    channel.send(args.join(" "));
  },
};
