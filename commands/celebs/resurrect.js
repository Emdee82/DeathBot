const find = require("../../common/find");
const error = require("../../common/error");

module.exports = {
    name: '!resurrect',
    description: 'Resurrect a celeb by ID',
    restrictionLevel: 2,
    execute(msg, args, stateFuncs, channel) {
      if (!args || !args[0]) {        
        error.usage("!resurrect id", msg);
        return;
      }

      const currentState = stateFuncs.getState();
      let celebId = find.findCeleb(args, msg, stateFuncs);
      if (!celebId) {
        return;
      }

      var celeb = {...currentState.celebs[celebId]};
      celeb.isAlive = true;
      stateFuncs.updateCeleb(celebId, celeb);
      channel.send(celeb.name + " lives once more!");
    },
};