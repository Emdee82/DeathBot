module.exports = {
    name: '!state',
    description: 'print the current value of state to the console',
    restrictionLevel: 1,
    execute(msg, args, state) {
      console.log(new Date(), JSON.stringify(state.stringifyState()));
    },
};