const { MessageEmbed } = require('discord.js');
const find = require("../../common/find")
const format = require("../../common/format")
const error = require("../../common/error")
const image = require("../../common/image-search");

module.exports = {
    name: '!celeb',
    description: 'Query a celeb',
    execute(msg, args, stateFuncs) {
      if (!args || !args[0]) {
        error.usage("!celeb [search-term]", msg);
        return;
      }

      const state = stateFuncs.getState();
      let celeb = find.findCeleb(args, msg, stateFuncs);

      if (!celeb) {
        return;
      }      

      var players = state.celebs[celeb].players.filter(playerId => {
          return state.players[playerId].picks.includes(celeb);
      });

      image.getImage(state.celebs[celeb].name)
        .then(imgPath => {
          let output = "Status: " + (state.celebs[celeb].isAlive ? "Alive" : "Dead");
          if(players.length > 0) {
            output = output + "\nPicked by: " + format.stringCommaList(players.map(player => state.players[player].name)) + ".";
          }

          const imageEmbed = new MessageEmbed()
            .setImage(imgPath);

          console.log("[celeb]: ",imgPath);
    
          let nameHeader = format.bold(state.celebs[celeb].name);
          msg.channel.send((state.celebs[celeb].isAlive ? nameHeader : format.strikethrough(nameHeader)) + " " + format.italic(`(ID: '${celeb}')`));
          msg.channel.send({embeds: [imageEmbed]}).then(() => {
            msg.channel.send(output)
          });
        });
    },
};