require('dotenv').config({ path: `../.env.${process.env.PROD ? "prod" : "dev"}` });
const error = require("../../common/error");
const find = require("../../common/find")
const image = require("../../common/image-search");
const celebAdder = require("../../common/add-celeb");
const playerAdder = require("../../common/add-player");
const format = require("../../common/format");
const { MessageEmbed } = require('discord.js');
const PICK_LIMIT = process.env.PICK_LIMIT;
const PICK_CUTOFF_DATE = new Date(process.env.PICK_CUTOFF_DATE + "T23:59:59.999");
const ALLOW_SAME_PICK = process.env.ALLOW_SAME_PICK;

module.exports = {
  name: "!pick",
  description: "Adds a named pick for the invoking user",
  execute(msg, args, stateFuncs) {
    if (new Date() > PICK_CUTOFF_DATE) {
        msg.reply(`No new picks are accepted after ${PICK_CUTOFF_DATE.toDateString()}.`);
        return;
    }

    if (!args || !args[0]) {
      error.usage("!pick [name]", msg);
      return;
    }

    let playerId = find.findPlayerByDiscordId(msg.author.id, stateFuncs);
    if (!playerId) {
        let newUserId = msg.author.id;
        playerId = playerAdder.addPlayer(stateFuncs, msg, msg.author.username, newUserId);
        msg.channel.send(`Welcome to the game, ${format.bold(msg.author.username + "!")}`);
    }

    if (stateFuncs.getState().players[playerId].picks.length >= +PICK_LIMIT) {
        msg.reply(`You already have ${PICK_LIMIT} picks - please remove one first if you'd like to replace it.`);
        return;
    }

    let state = stateFuncs.getState();
    let celeb = find.findCeleb(args, null, stateFuncs, true);
    let celebName = args.join(" ");

    if (!celeb) {
        celeb = celebAdder.addCeleb(stateFuncs, msg, celebName);
        state = stateFuncs.getState();
    } else {
        celebName = state.celebs[celeb].name;
    }

    let player = {...state.players[playerId]};
    if (player.picks.includes(celeb)) {
        msg.reply(`You've already picked ${celebName}.`);
        return;
    }
    
    if (!(+ALLOW_SAME_PICK) && state.celebs[celeb].players.length > 0) {
        msg.reply(`${celebName} has already been picked by ${format.bold(state.players[state.celebs[celeb].players[0]].name)} - players aren't allowed to have the same pick.`);
        return;
    }

    player.picks = [
        ...player.picks,
        celeb
    ];
    stateFuncs.updatePlayer(playerId, player);

    let newCeleb =  {...state.celebs[celeb]};
    newCeleb.players = [
        ...newCeleb.players,
        playerId
    ];
    stateFuncs.updateCeleb(celeb, newCeleb);

    msg.channel.send(`${format.bold(state.players[playerId].name)} has picked ${format.bold(celebName)}`);

    image.getImage(celebName)
    .then(imgPath => {
        const imageEmbed = new MessageEmbed()
        .setImage(imgPath);

        msg.channel.send({embeds: [imageEmbed]});
    });
  }
}