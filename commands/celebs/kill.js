const killer = require("../../common/kill");
const find = require("../../common/find");
const error = require("../../common/error");

module.exports = {
    name: '!kill',
    description: 'Kill a celeb by ID',
    restrictionLevel: 2,
    execute(msg, args, stateFuncs) {
      if (!args || !args[0]) {
        error.usage("!kill id", msg);
        return;
      }

      let celeb = find.findCeleb(args, msg, stateFuncs);
      let age = args.join(" ").match(/\d+/);

      killer.kill(celeb, stateFuncs, (x) => msg.channel.send(x), age ? age[0] : undefined);
    },
};