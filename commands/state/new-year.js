module.exports = {
  name: "!new-year",
  description:
    "Reset the scoreboard and archive current picks to previous year",
  restrictionLevel: 1,
  execute(msg, args, stateFuncs) {
    stateFuncs.saveNewYearState();

    let state = stateFuncs.getState();
    // Update all player to reset score, picks and archive previous picks
    state.playerKeys.forEach((playerId) => {
      let newPlayer = { ...state.players[playerId] };
      newPlayer.lastYearPicks = [...newPlayer.picks];
      newPlayer.picks = [];
      newPlayer.bonuses = {};
      newPlayer.basePoints = 0;
      newPlayer.totalScore = 0;
      newPlayer.protectCount = 0;
      newPlayer.stealCount = 0;
      stateFuncs.updatePlayer(playerId, newPlayer);
    });

    // Update the player list of all celebs to an empty list
    celebKeys = Object.keys(state.celebs);
    celebKeys.forEach((celebId) => {
      let newCeleb = { ...state.celebs[celebId] };
      newCeleb.players = [];
      newCeleb.stolenFrom = undefined;
      stateFuncs.updateCeleb(celebId, newCeleb);
    });
  },
};
