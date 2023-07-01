module.exports = {
    name: '!get-chat',
    description: 'Print the current chat backlog to the console',
    restrictionLevel: 1,
    execute(msg, args, stateFuncs) {
      var state = stateFuncs.getState();
      console.log(state.chatMessages);
    },
};