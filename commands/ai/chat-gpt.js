const fs = require("fs");
const OpenAI = require("openai")
const OPENAI_ENABLED = process.env.OPENAI_ENABLED;
const BOT_USER_ID = process.env.BOT_USER_ID;

const configuration = new OpenAI.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI.OpenAIApi(configuration);

const path = "commands/ai/prompt.txt";
const samplePath = "commands/ai/sample-response3.txt";

var prompt = "";

const loadPrompt = () => {
    if (fs.existsSync(path)) {
        prompt = fs.readFileSync(path, "utf8");
    }
}

const sampleResponse = () => {
    if (fs.existsSync(path)) {
        return fs.readFileSync(samplePath, "utf8");
    }
}

exports.chatGpt = async (stateFuncs, msg) => {
  if(+OPENAI_ENABLED) {    
    if (!configuration.apiKey) {
        console.error("OpenAI API key not configured");
        msg.reply("Open AI configuration missing. Get Mike to fix it.");
      return;
    }

    try {
      loadPrompt();
      const state = stateFuncs.getState();
      var messageContent = msg.content.replace(`<@${BOT_USER_ID}>`, 'DeathBot,');
      console.log(new Date(), `[chat-gpt]: ${msg.author.username} has asked:`, messageContent);

      var sender = state.playerKeys.filter(x => (msg.author.username +'#' + msg.author.discriminator) == state.players[x].userId);
      
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: prompt},
          {role: "user", content: (sender || "Someone") + " has said the following - reply in character: " + messageContent}
        ],
        max_tokens: 1500
      });
      
      // console.log(new Date(), "[chat-gpt]: Completion: ", completion);
      // console.log(new Date(), "[chat-gpt]: Choices: ", completion.data.choices);
      // console.log(new Date(), "[chat-gpt]: Choices[0]: ", completion.data.choices[0]);
      // console.log(new Date(), "[chat-gpt]: Choices[0].text: ", completion.data.choices[0].message);
      
      var responses = completion.data.choices[0].message.content.split(/\r?\n\r?\n/);
      responses.forEach(res => {
        if (res && res.match(/[a-zA-Z0-9]+/)) {
          console.log(new Date(), "[chat-gpt]: Replying with: ", res);
          msg.channel.send(res.replace(/deathbot/ig, '**DeathBot**'));
        }
      })      
    } 
    catch(error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
        msg.reply("An error occurred with this command, causing it to fail.");
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        msg.reply(`Error with OpenAI API request: ${error.message}`);
      }
    }
  } else {
    console.log(new Date(), "[chat-gpt]: ChatGPT disabled.");
  }
}