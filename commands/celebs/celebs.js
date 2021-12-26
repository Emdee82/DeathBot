
module.exports = {
    name: '!celebs',
    description: 'Query celebs',
    execute(msg, args, stateFuncs) {
      const state = stateFuncs.getState();
      var celebs = Object.keys(state.celebs);

      msg.channel.send(`I'm currently tracking ${celebs.length} celebrities, too many to output on Discord all at once.`)      
      msg.channel.send("Use the '!celeb' command to query for someone in particular.")
    },
};