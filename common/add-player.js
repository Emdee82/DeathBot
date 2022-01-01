const find = require("./find");

exports.addPlayer = (stateFuncs, msg, playerName, userId) => {
    // Normalise name and create new ID
    let newId = playerName
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[^a-z_-]+/g, "");

    // Check if ID already exists
    let player = newId;
    if (find.findPlayer(player, msg, stateFuncs, true)) {
      msg.channel.send(`This person is already on my list - ID: ${newId}`);
      return;
    }

    newId = player;

    const newPlayer = {
      name: playerName,
      userId: userId,
      basePoints: 0,
      picks: [],
      bonuses: {}
    };
    
    stateFuncs.addPlayer(newId, newPlayer);
    return newId;
}