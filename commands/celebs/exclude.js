const find = require("../../common/find");
const error = require("../../common/error");

module.exports = {
    name: '!exclude',
    description: 'Exclude a celeb from the automated wiki search',
    restrictionLevel: 2,
    execute(msg, args, stateFuncs) {
      if (!args || !args[0]) {        
        error.usage("!exclude id", msg);
        return;
      }

      const currentState = stateFuncs.getState();
      let celebId = find.findCeleb(args, msg, stateFuncs);

      var celeb = {...currentState.celebs[celebId]};
      celeb.excludeFromAuto = true;
      stateFuncs.updateCeleb(celebId, celeb);
      msg.channel.send(celeb.name + " is now no longer being watched.");
    },
};