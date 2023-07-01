const OpenAI = require("openai")
const OPENAI_ENABLED = process.env.OPENAI_ENABLED;
const BOT_USER_ID = process.env.BOT_USER_ID;

const configuration = new OpenAI.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI.OpenAIApi(configuration);

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
      var messageContent = msg.content.replace(`<@${BOT_USER_ID}>`, 'DeathBot,');
      console.log(new Date(), `[chat-gpt]: ${msg.author.username} has asked:`, messageContent);
      var sender = state.playerKeys.filter(x => (msg.author.id == state.players[x].userId));
      state.chatMessages = stateFuncs.addMessage("user", (sender || "Someone") + " has said the following - reply in character: " + messageContent);

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: state.chatMessages,
        max_tokens: 3000
      });
      
      var reply = completion.data.choices[0].message.content;
      state.chatMessages = stateFuncs.addMessage("assistant", reply);
      var responses = reply.split(/\r?\n\r?\n/);
      
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