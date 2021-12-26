module.exports = {
  name: '!load-state',
  description: 'print the current value of state to the console',
  execute(msg, args, stateFuncs) {
    stateFuncs.loadState();
  },
};