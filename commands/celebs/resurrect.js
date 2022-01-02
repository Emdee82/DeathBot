const find = require("../../common/find");
const error = require("../../common/error");

module.exports = {
    name: '!resurrect',
    description: 'Resurrect a celeb by ID',
    restrictionLevel: 2,
    execute(msg, args, stateFuncs) {
      if (!args || !args[0]) {        
        error.usage("!resurrect id", msg);
        return;
      }

      const currentState = stateFuncs.getState();
      let celebId = find.findCeleb(args, msg, stateFuncs);

      var celeb = {...currentState.celebs[celebId]};
      celeb.isAlive = true;
      stateFuncs.updateCeleb(celebId, celeb);
      msg.channel.send(celeb.name + " lives once more!");
    },
};