module.exports = {
    name: '!state',
    description: 'print the current value of state to the console',
    execute(msg, args, state) {
      console.log(new Date(), JSON.stringify(state.stringifyState()));
    },
};