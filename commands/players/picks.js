const format = require("../../common/format");
const find = require("../../common/find");

module.exports = {
  name: "!picks",
  description: "Prints everyone's picks",
  execute(msg, args, stateFuncs) {
    msg.channel.send(format.bold("The Picks"));

    const currentState = stateFuncs.getState();
    const players = currentState.players;
    let playerKeys = (args && args[0]) ? [find.findPlayer(args[0], msg, stateFuncs)] : currentState.playerKeys.filter(x => players[x].picks.length > 0);

    if(args && args[0] && !players[playerKeys[0]]) {
      return;
    }

    playerKeys
      .forEach((playerId) => {
        let output = format.bold(players[playerId].name);

        for (let i = 0; i < players[playerId].picks.length; i++) {
          let celeb = currentState.celebs[players[playerId].picks[i]];
          output = output +
            "\n" + (i+1) + ". " + (celeb.isAlive ? celeb.name : (format.strikethrough(celeb.name)));
        }

        msg.channel.send(output + "\n");
      });

  },
};
