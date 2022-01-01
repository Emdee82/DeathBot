require('dotenv').config({ path: `.env.${process.env.PROD ? "prod" : "dev"}` });
const Discord = require('discord.js');
const botCommands = require('./commands');
const stateFuncs = require("./common/state");
const jobManager = require("./jobs/job-manager");

const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });
bot.commands = new Discord.Collection();

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

console.log(new Date(), "[death-bot]: Initialising state...");
stateFuncs.init();
console.log(new Date(), "[death-bot]: State initialised successfully!");
let server = null;
let channel = null;
let voiceChannel = null;

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

  if (!bot.commands.has(command)) return;

  try {
    let botCommand = bot.commands.get(command);
    if (botCommand && command === "!ppt") {
      botCommand.execute(channel, args);
    } else {
      botCommand.execute(msg, args, stateFuncs);
    }
  } catch (error) {
    console.error(error);
    msg.reply("An error occurred with this command, causing it to fail.");
  }
});


bot.on('error', err => {
  console.error(new Date(), "[death-bot]: An unknown error occurred - details follow:", err);
});