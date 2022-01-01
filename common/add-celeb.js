const find = require("./find");

exports.addCeleb = (stateFuncs, msg, celebName) => {
    // Normalise name and create new ID
    let newId = celebName
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[^a-z_-]+/g, "");

    // Check if ID already exists
    let celeb = newId;
    if (find.findCeleb([celeb], msg, stateFuncs, true)) {
      msg.channel.send(`This person is already on my list - ID: ${newId}`);
      return;
    }

    newId = celeb;

    const newCeleb = {
      name: celebName,
      isAlive: true,
      players: [],
    };
    
    stateFuncs.addCeleb(newId, newCeleb);
    return newId;
}