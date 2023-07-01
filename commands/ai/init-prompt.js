const fs = require("fs");
const OPENAI_ENABLED = process.env.OPENAI_ENABLED;

const path = "commands/ai/prompt.txt";

var prompt = "";

const calculateScore = (state, playerId) => {  
  const players = state.players;
  if(!players[playerId]) {
    return 0;
  }

  // Calculate total score
  let score = players[playerId].basePoints;

  if (players[playerId].bonuses) {
    let bonusKeys = Object.keys(players[playerId].bonuses);
    bonusKeys.forEach(bonusKey => {
      let bonus = state.bonuses[bonusKey];
      score = score + (bonus.points * players[playerId].bonuses[bonusKey].times);
    });

    return score;
  };
}

const insertPicks = (state, playerId) => {
  var picks = "";
  state.players[playerId].picks.forEach(pick => {
    picks = picks + "\r\n    " + (state.celebs[pick].isAlive ? state.celebs[pick].name : `${state.celebs[pick].name} (Deceased)`);
  });

  return picks;
}

const insertGameState = (state) => {
  var stateReplace = "";
  state.playerKeys.forEach(playerId => {
    stateReplace = stateReplace + "\r\n"
    + "- Name: " + state.players[playerId].name + "\r\n"
    + "  Gender: Male\r\n" // TODO: Update this to be more inclusive.
    + "  Points: " + calculateScore(state, playerId) + "\r\n"
    + "  Picks: " + insertPicks(state, playerId);
  });

  return stateReplace;
}

const loadPrompt = (state) => {
    if (fs.existsSync(path)) {
        prompt = fs.readFileSync(path, "utf8");
    }

    var gameStateInsert = insertGameState(state);
    return prompt.replace(/\[STATEREPLACE\]/ig, gameStateInsert);
}

exports.initPrompt = (state) => {
  if(+OPENAI_ENABLED) {
    return loadPrompt(state);
  } else {
    console.log(new Date(), "[chat-gpt]: ChatGPT disabled.");
  }
}