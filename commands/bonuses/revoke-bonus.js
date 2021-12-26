const find = require("../../common/find");
const error = require("../../common/error");
const format = require("../../common/format");

module.exports = {
  name: "!revoke",
  description: "Revoke a bonus to given player(s)",
  execute(msg, args, stateFuncs) {
    if(!args || args.length < 3) {
        error.usage("!revoke [bonusId] [celebId] [playerId1 playerId2...]", msg);
        return;
    }

    const bonusKey = args[0];
    const celebId = args[1];
    const state = stateFuncs.getState();
    let bonus = "";

    if(!state.bonuses[bonusKey]) {
        msg.channel.send(`Bonus with ID ${bonusKey} was not found.`);
        return;
    } else if (!state.celebs[celebId]) {
        msg.channel.send(`Celeb with ID ${celebId} was not found.`);
        return;
    }

    bonus = state.bonuses[bonusKey];

    const inputIds = args.slice(2);
    const playerIds = [];
    let failed = false;
    
    // Validate player inputs before updating anyone (guard against partial updates)
    inputIds.forEach(inputId => {
        let validatedId = find.findPlayer(inputId, msg, stateFuncs);
        if(!validatedId) {
            failed = true;
            return;
        } else {
            if (!state.players[validatedId].bonuses[bonusKey]) {
                msg.channel.send(`Player with id ${inputId} does not have bonus ${bonusKey}.`);
                failed = true;
                return;
            } else {
                playerIds.push(validatedId);
            }
        }
    })

    if(failed) {
        return;
    }

    playerIds.forEach(playerId => {
        let player = {...state.players[playerId]};
        
        player.bonuses[bonusKey].times = player.bonuses[bonusKey].times - 1;
        player.bonuses[bonusKey].celebs = player.bonuses[bonusKey].celebs.filter(id => id !== celebId);
        if (player.bonuses[bonusKey].times === 0) {
            delete player.bonuses[bonusKey];
        }        

        stateFuncs.updatePlayer(playerId, player);
    })

    let winners = state.playerKeys.filter(x => playerIds.includes(x)).map(winner => state.players[winner].name);
    const winnerList = format.stringCommaList(winners);
    msg.channel.send(`'${format.bold(bonus.name)}' has been revoked from ${winnerList} and ${bonus.points} points deducted${winners.length > 1 ? " each." : "."}`);
  },
};
