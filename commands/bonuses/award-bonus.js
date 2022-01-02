const find = require("../../common/find");
const error = require("../../common/error");
const format = require("../../common/format");

module.exports = {
  name: "!award",
  description: "Award a bonus to given player(s)",
  restrictionLevel: 2,
  execute(msg, args, stateFuncs) {
    if(!args || args.length < 3) {
        error.usage("!award [bonusId] [celebId] [playerId1 playerId2...]", msg);
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
    } else {
        bonus = (state.bonuses[bonusKey]);
    }

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
            playerIds.push(validatedId);
        }
    });

    if(failed) {
        return;
    }

    playerIds.forEach(playerId => {
        let player = {...state.players[playerId]};
        
        if (!player.bonuses[bonusKey]) {
            player.bonuses = {
                ...player.bonuses,
                [bonusKey]: {
                    times: 1,
                    celebs: [ celebId ]
                },
            };
        }
        else {
            player.bonuses[bonusKey].times = player.bonuses[bonusKey].times + 1;
            if (!player.bonuses[bonusKey].celebs.includes(celebId)) {
                player.bonuses[bonusKey].celebs.push(celebId);
            }
        }

        stateFuncs.updatePlayer(playerId, player);
    })

    let winners = state.playerKeys.filter(x => playerIds.includes(x)).map(winner => state.players[winner].name);
    const winnerList = format.stringCommaList(winners);
    msg.channel.send(`'${format.bold(bonus.name)}' has been awarded to ${winnerList} for a bonus of ${bonus.points} ${winners.length > 1 ? "points each" : "points"} for picking ${state.celebs[celebId].name}. Congratulations.`);
  },
};
