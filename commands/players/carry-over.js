require('dotenv').config({ path: `../.env.${process.env.PROD ? "prod" : "dev"}` });
const error = require("../../common/error");
const find = require("../../common/find")
const image = require("../../common/image-search");
const celebAdder = require("../../common/add-celeb");
const playerAdder = require("../../common/add-player");
const format = require("../../common/format");
const PICK_LIMIT = process.env.PICK_LIMIT;
const PICK_CUTOFF_DATE = new Date(process.env.PICK_CUTOFF_DATE);

module.exports = {
  name: "!carry-over",
  description: "Carries over all previous year's picks for the invoking user",
  execute(msg, args, stateFuncs) {
    if (new Date() > PICK_CUTOFF_DATE) {
        msg.reply(`No alterations to picks are accepted after ${PICK_CUTOFF_DATE.toDateString()}.`);
        return;
    }

    let state = stateFuncs.getState();
    let playerId = find.findPlayerByUsername(msg.author.username, msg.author.discriminator, stateFuncs);
    if (!playerId) {
        msg.channel.send("You don't have any picks from last year.\nUse the '!pick' command instead to select a pick and join the game.");
        return;
    }

    var player = {...state.players[playerId]};
    var oldPicks = player.lastYearPicks.filter(x => state.celebs[x].isAlive);
    console.log(new Date(), "[carry-over]: Carrying over picks for " + msg.author.username);
    let combinedPicks = [
        ...player.picks,
        ...oldPicks
    ];
    player.picks = [...new Set(combinedPicks.map(x => x))];

    if (player.picks.length > PICK_LIMIT) {
        msg.reply(`Last year's picks plus the ones you've picked for this year would take you over the limit of ${PICK_LIMIT}.\nPlease remove some current picks first if you'd like to replace them.`);
        return;
    }

    stateFuncs.updatePlayer(playerId, player);
    oldPicks.forEach(celeb => {
        let newCeleb =  {...state.celebs[celeb]};
        newCeleb.players = [...new Set([
            ...newCeleb.players,
            playerId
        ])].map(x => x);
        stateFuncs.updateCeleb(celeb, newCeleb);
    });

    msg.channel.send(`${format.bold(state.players[playerId].name)} has carried over all of last year's picks.`);
  }
}