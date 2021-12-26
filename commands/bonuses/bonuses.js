const format = require("../../common/format");
const find = require("../../common/find");

module.exports = {
  name: "!bonuses",
  description: "List awarded bonuses",
  execute(msg, args, stateFuncs) {
    msg.channel.send(format.bold("The Awards"));

    const state = stateFuncs.getState();
    const players = state.players;
    let playerKeys =
      args && args[0]
        ? [find.findPlayer(args[0], msg, stateFuncs)]
        : state.playerKeys;
    let wonSomething = false;

    if (args && args[0] && !players[playerKeys[0]]) {
      return;
    }

    playerKeys.forEach((playerId) => {
      let player = state.players[playerId];
      let output = format.bold(player.name);
      let bonuses = Object.keys(player.bonuses);
      if (bonuses.length > 0) {
        wonSomething = true;
        bonuses.forEach((bonusKey) => {
          let bonus = state.bonuses[bonusKey] || state.thirdPartyBonuses[bonusKey]
          let celebs = format.stringCommaList(
            player.bonuses[bonusKey].celebs.map((x) => state.celebs[x].name)
          );
          output =
            output +
            `\n - Won '${format.bold(
                bonus.name
            )}' (${player.bonuses[bonusKey].times <= 1 ? "+"+bonus.points : player.bonuses[bonusKey].times+"*"+bonus.points} points) for picking ${celebs}.`;
        });
        msg.channel.send(output + "\n");
      }
    });

    if (!wonSomething) {
      msg.channel.send(`... ${args[0] ? players[playerKeys[0]].name + " hasn't" : "Nobody's"} won anything.`);
    }
  },
};
