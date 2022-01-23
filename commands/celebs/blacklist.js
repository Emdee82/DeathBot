const error = require("../../common/error");
const format = require("../../common/format");

module.exports = {
    name: '!blacklist',
    description: 'Add a blacklisted search term to a celeb to prevent triggering the kill if the term is detected',
    restrictionLevel: 2,
    execute(msg, args, stateFuncs) {
      if (!args || args.length < 2) {        
        error.usage("!blacklist [id] [term to exclude from future searches]", msg);
        return;
      }

      let blacklistName = args.slice(1).join(" ");

      const currentState = stateFuncs.getState();
      let celebId = args[0];
      if (!currentState.celebs[celebId]) {
        channel.send(`Celeb with ID ${celebId} was not found.`);
      }

      var celeb = {...currentState.celebs[celebId]};
      celeb.blacklist = celeb.blacklist || [];
      celeb.blacklist = [
        ...celeb.blacklist,
        blacklistName
      ];
      stateFuncs.updateCeleb(celebId, celeb);
      msg.channel.send(`${format.bold(blacklistName)} has now been added to the blacklist for ${format.bold(celeb.name)}`);
    },
};