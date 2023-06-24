require('dotenv').config({ path: `.env.${process.env.PROD ? "prod" : "dev"}` });
const Discord = require('discord.js');
const botCommands = require('./commands');
const stateFuncs = require("./common/state");
const jobManager = require("./jobs/job-manager");
const aiFuncs = require("./commands/ai/chat-gpt");

const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });
bot.commands = new Discord.Collection();

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;
const BOT_USER_ID = process.env.BOT_USER_ID;

console.log(new Date(), "[death-bot]: Initialising state...");
stateFuncs.init();
console.log(new Date(), "[death-bot]: State initialised successfully!");
let server = null;
let channel = null;
let voiceChannel = null;

const isRestrictedCommand = (cmd, msg) => {
  if (!cmd.restrictionLevel) {
    return false;
  }

  var currentState = stateFuncs.getState();
  var user = currentState.privilegedUsers[msg.author.id];

  if (!user || cmd.restrictionLevel < user.restrictionLevel) {
    console.error(`Restricted command - ${msg.author.username} attempted to invoke`, cmd);
    return true;
  }
  
  return false;
}

bot.login(TOKEN);

bot.once('ready', () => {
  console.log(new Date(), `[death-bot]: Bot logged in under username ${bot.user.tag}`);
  bot.user.setPresence({
      activities: [
        {
          name: "Chess",
          type: "PLAYING"
        }
      ]
  });
  
  console.log(new Date(), "[death-bot]: Establishing channel connections...");
  server = bot.guilds.cache.get(process.env.SERVER);
  channel = server.channels.cache.get(process.env.CHANNEL);
  voiceChannel = server.channels.cache.get(process.env.VOICE);
  console.log(new Date(), "[death-bot]: Channel connections established successfully.");

  // Start scheduled jobs
  jobManager.init(stateFuncs, channel);
});

bot.on('messageCreate', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (msg.content.includes(`<@${BOT_USER_ID}>`)) {
    aiFuncs.chatGpt(stateFuncs, msg);
    return;
  }

  if (!bot.commands.has(command)) return;

  try {
    let botCommand = bot.commands.get(command);
    if (isRestrictedCommand(botCommand, msg)) {
      return;
    }

    botCommand.execute(msg, args, stateFuncs, channel);    
  } catch (error) {
    console.error(error);
    msg.reply("An error occurred with this command, causing it to fail.");
  }
});


bot.on('error', err => {
  console.error(new Date(), "[death-bot]: An unknown error occurred - details follow:", err);
});