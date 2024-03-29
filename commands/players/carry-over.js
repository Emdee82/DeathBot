require('dotenv').config({ path: `../.env.${process.env.PROD ? "prod" : "dev"}` });
const find = require("../../common/find")
const format = require("../../common/format");
const PICK_LIMIT = process.env.PICK_LIMIT;
const PICK_CUTOFF_DATE = new Date(process.env.PICK_CUTOFF_DATE  + "T23:59:59.999");
const ALLOW_SAME_PICK = process.env.ALLOW_SAME_PICK;

module.exports = {
  name: "!carry-over",
  description: "Carries over all previous year's picks for the invoking user",
  execute(msg, args, stateFuncs) {
    if (new Date() > PICK_CUTOFF_DATE) {
        msg.reply(`No alterations to picks are accepted after ${PICK_CUTOFF_DATE.toDateString()}.`);
        return;
    }

    let state = stateFuncs.getState();
    let playerId = find.findPlayerByDiscordId(msg.author.id, stateFuncs);
    if (!playerId) {
        msg.channel.send("You don't have any picks from last year.\nUse the '!pick' command instead to select a pick and join the game.");
        return;
    }

    var player = {...state.players[playerId]};
    var oldPicks = player.lastYearPicks.filter(x => state.celebs[x].isAlive && (+ALLOW_SAME_PICK || state.celebs[x].players.length === 0));
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

    if (!(+ALLOW_SAME_PICK)) {
        var disallowedPicks = player.lastYearPicks.filter(x => state.celebs[x].isAlive && state.celebs[x].players.length > 0);
        if (disallowedPicks.length > 0) {
            const winnerString = format.stringCommaList(disallowedPicks.map(pick => state.celebs[pick].name));
            msg.channel.send(`${winnerString} had already been picked by others this year, so have not been carried over.`);
        }
    }
  }
}