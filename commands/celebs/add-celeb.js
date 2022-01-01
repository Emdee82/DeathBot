const error = require("../../common/error");
const image = require("../../common/image-search");
const celebAdder = require("../../common/add-celeb");
const { MessageEmbed } = require('discord.js');

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

    let newId = celebAdder.addCeleb(stateFuncs, msg, celebName);
    msg.channel.send(`${celebName} has now been added to my list. (ID: ${newId})`);

    image.getImage(celebName)
    .then(imgPath => {
        const imageEmbed = new MessageEmbed()
        .setImage(imgPath);

        msg.channel.send({embeds: [imageEmbed]});
    });
  }
}