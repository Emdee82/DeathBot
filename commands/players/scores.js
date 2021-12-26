const format = require("../../common/format");

module.exports = {
  name: "!scores",
  description: "Print the current scoreboard to the console",
  execute(msg, args, stateFuncs) {
    let output = format.bold("The Current Leaderboard");

    const state = stateFuncs.getState();
    const players = state.players;
    let playerKeys = state.playerKeys;

    // Calculate total scores
    playerKeys.forEach(playerId => {
      let score = players[playerId].basePoints;

      if (players[playerId].bonuses) {
        let bonusKeys = Object.keys(players[playerId].bonuses);
        bonusKeys.forEach(bonusKey => {
          let bonus = state.bonuses[bonusKey] || state.thirdPartyBonuses[bonusKey];
          score = score + (bonus.points * players[playerId].bonuses[bonusKey].times);
        });
      }

      players[playerId].totalScore = score;
    });

    // Display scores in descending order
    playerKeys
      .sort((a, b) => players[b].totalScore - players[a].totalScore)
      .forEach((playerId) => {
        output = output +
          "\n" + format.bold(players[playerId].name) + " - Score: " + players[playerId].totalScore;
      });

    msg.channel.send(output);
  },
};
