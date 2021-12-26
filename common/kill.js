require('dotenv').config({ path: `../.env.${process.env.PROD ? "prod" : "dev"}` });
const { MessageEmbed } = require('discord.js');
const format = require("./format")
const image = require("./image-search");
const BASE_SCORE = 100;
const ALERT_EMOJI = process.env.ALERT_EMOJI;
const ALERT_EMOJI_REPEAT = process.env.ALERT_EMOJI_REPEAT;

exports.kill = (id, stateFuncs, senderFunc, age) => {
    var currentState = stateFuncs.getState();
    const score = age ? (BASE_SCORE - age) : 0;

    if (!currentState.celebs[id]) {
        senderFunc(id + " is not on my list... yet.");
        return;
    }

    var celeb = {...currentState.celebs[id]};

    var winners = celeb.players.filter(playerId => {
        return currentState.players[playerId].picks.includes(id);
    });

    var losers = celeb.players.filter(playerId => {
        return currentState.players[playerId].changed.includes(id);
    });

    const emojis = [];
    for (var i=0; i<+ALERT_EMOJI_REPEAT; i++) {
        emojis.push(ALERT_EMOJI);
    }

    senderFunc(emojis.join(" "));
    senderFunc(format.bold("The bell has tolled for " + celeb.name + "!"));

    image.getImage(celeb.name)
    .then(imgPath => {
        const imageEmbed = new MessageEmbed()
        .setImage(imgPath);

        senderFunc({embeds: [imageEmbed]}).then(() => {
            if (winners.length > 0) {
                if (age) {
                    winners.forEach(winner => {
                        let player = {...currentState.players[winner]};
                        player.basePoints = player.basePoints + score;
                        stateFuncs.updatePlayer(winner, player);
                    });
                }
    
                const winnerString = format.stringCommaList(winners.map(winner => currentState.players[winner].name));
                
                let winMessage = `Congratulations to ${winnerString} for ${winners.length === 1 ? "the" : "their"} winning pick`
                if (age) {
                    winMessage = winMessage + `\nAt age ${age}, ${celeb.name} yields a base score of ${format.bold(score)}.`;
                } else {
                    winMessage = winMessage + "\nAt time of writing age was unknown, so please allocate points manually."
                }
    
                senderFunc(winMessage);
            }
    
            if (losers.length > 0) {
                const loserString = format.stringCommaList(losers.map(loser => currentState.players[loser].name));
                senderFunc(`Commiserations to ${loserString}, who briefly considered this pick before changing their mind.`);
            }
        });
    });

    celeb.isAlive = false;
    stateFuncs.updateCeleb(id, celeb);   
    stateFuncs.saveState(); 
}