const checker = require("../../common/check-wiki");

module.exports = {
    name: '!check',
    description: 'Checks the list manually',
    execute(msg, args, stateFuncs) {
      if (args && args[0]) {
        error.usage("!check", msg);
        return;
      }

      checker.checkWiki(stateFuncs, msg.channel, false);
    },
};