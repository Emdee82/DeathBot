const fs = require("fs");
const OpenAI = require("openai")
const OPENAI_ENABLED = process.env.OPENAI_ENABLED;
const BOT_USER_ID = process.env.BOT_USER_ID;

const configuration = new OpenAI.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI.OpenAIApi(configuration);

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
    prompt = prompt.replace(/\[STATEREPLACE\]/ig, gameStateInsert);
}

const breakdownLongMessage = (message) => message.match(/.{1,1950}/g);

exports.chatGpt = async (stateFuncs, msg) => {
  if(+OPENAI_ENABLED) {    
    if (!configuration.apiKey) {
        console.error("OpenAI API key not configured");
        msg.reply("Open AI configuration missing. Get Mike to fix it.");
      return;
    }

    try {
      const state = stateFuncs.getState();
      loadPrompt(state);

      var messageContent = msg.content.replace(`<@${BOT_USER_ID}>`, 'DeathBot,');
      console.log(new Date(), `[chat-gpt]: ${msg.author.username} has asked:`, messageContent);
      var sender = state.playerKeys.filter(x => (msg.author.id == state.players[x].userId));
      
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: prompt},
          {role: "user", content: (sender || "Someone") + " has said the following - reply in character: " + messageContent}
        ],
        max_tokens: 1500
      });
      
      var responses = completion.data.choices[0].message.content.split(/\r?\n\r?\n/);
      
      responses.forEach(res => {
        if (res && res.match(/[a-zA-Z0-9]+/)) {
          var resToSend = res.length > 1950 ? breakdownLongMessage(res) : [ res ];

          resToSend.forEach(r => {
            msg.channel.send(r.replace(/deathbot/ig, '**DeathBot**'));
          });
        }
      })
    } 
    catch(error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(new Date(), `[chat-gpt]: Error with OpenAI API request: ${error.message}`);
        msg.reply(new Date(), `[chat-gpt]: Error with OpenAI API request: ${error.message}`);
      }
    }
  } else {
    console.log(new Date(), "[chat-gpt]: ChatGPT disabled.");
  }
}