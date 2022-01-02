const format = require("../../common/format");
const find = require("../../common/find");
const pointManager = require("../../common/point-manager")
const error = require("../../common/error");

module.exports = {
  name: "!set-points",
  description: "Overwrite a player's base points with the given value (doesn't apply to bonuses)",
  restrictionLevel: 1,
  execute(msg, args, stateFuncs) {
    if (!(args && args[0] && args[1])) {
      error.usage("!setPoints [points] [playerId]", msg);
      return;
    }

    if (!find.findPlayer(args[1], msg, stateFuncs)) {
      return;
    }

    pointManager.setPoints(args[1], +args[0], stateFuncs);
    msg.channel.send(`Points for ${args[1]} updated.`);
  },
};
