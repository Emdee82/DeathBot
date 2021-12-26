const find = require("../../common/find");
const error = require("../../common/error");

module.exports = {
    name: '!include',
    description: 'Include a previously excluded celeb in the automated wiki search',
    execute(msg, args, stateFuncs) {
      if (!args || !args[0]) {        
        error.usage("!include id", msg);
        return;
      }

      const currentState = stateFuncs.getState();
      let celebId = find.findCeleb(args, msg, stateFuncs);

      var celeb = {...currentState.celebs[celebId]};
      celeb.excludeFromAuto = false;
      stateFuncs.updateCeleb(celebId, celeb);
      msg.channel.send(celeb.name + " is being watched once more!");
    },
};