require('dotenv').config({ path: `../.env.${process.env.PROD ? "prod" : "dev"}` });
const error = require("../../common/error");
const find = require("../../common/find")
const format = require("../../common/format");
const PICK_CUTOFF_DATE = new Date(process.env.PICK_CUTOFF_DATE + "T23:59:59.999");

module.exports = {
  name: "!remove-pick",
  description: "Removes a named pick for the invoking user",
  execute(msg, args, stateFuncs) {
    if (new Date() > PICK_CUTOFF_DATE) {
        msg.reply(`No adjustments to picks are accepted after ${PICK_CUTOFF_DATE.toDateString()}.`);
        return;
    }

    if (!args || !args[0]) {
      error.usage("!remove-pick [name]", msg);
      return;
    }

    let playerId = find.findPlayerByUsername(msg.author.username, msg.author.discriminator, stateFuncs);
    if (!playerId) {
        msg.channel.send(`Unable to find player ${format.bold(msg.author.username)}.`);
        return;
    }

    let state = stateFuncs.getState();
    let celeb = find.findCeleb(args, null, stateFuncs, true);
    let celebName = args.join(" ");

    if (!celeb) {
        msg.channel.send(`${format.bold(celebName)} isn't on your list. Or mine for that matter.`);
        return;
    }

    let player = {...state.players[playerId]};
    if (!player.picks.includes(celeb)) {
        msg.reply(`You don't have ${celebName} on your list.`);
        return;
    }

    player.picks = player.picks.filter(x => x !== celeb);
    stateFuncs.updatePlayer(playerId, player);

    let newCeleb =  {...state.celebs[celeb]};
    newCeleb.players = newCeleb.players.filter(x => x !== playerId);
    stateFuncs.updateCeleb(celeb, newCeleb);

    msg.channel.send(`${format.bold(state.players[playerId].name)} has removed ${format.bold(celebName)} from their list.`);
  }
}