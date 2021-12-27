const find = require("../../common/find");
const format = require("../../common/format");
const error = require("../../common/error");
const image = require("../../common/image-search");

module.exports = {
  name: "!add-celeb",
  description: "Add a new celeb",
  execute(msg, args, stateFuncs) {
    if (!args || !args[0]) {
      error.usage("!add-celeb [name]", msg);
      return;
    }

    let celebName = args.join(" ");
    console.log("[add-celeb]: ", args);
    console.log("[add-celeb]: ", celebName);

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
    msg.channel.send(`${celebName} has now been added to my list. (ID: ${newId})`);
  },
};
