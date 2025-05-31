const OPENAI_ENABLED = process.env.OPENAI_ENABLED;
const { MessageEmbed } = require('discord.js');
const format = require("../../common/format")
const error = require("../../common/error");
const { configureOpenApi } = require("./open-api-config");
const PAINT_KEY = process.env.OPENAI_PAINT_API_KEY;
const PAINT_URL = process.env.OPENAI_PAINT_URL;
const PAINT_MODEL = process.env.OPENAI_PAINT_MODEL;

const paintConfig = () => {
    return configureOpenApi({
        apiKey: PAINT_KEY,
        baseURL: PAINT_URL,
    });
};

module.exports = {
    name: '!paint',
    description: 'Generates an image using the configure AI model and describes the output.',
    async execute(msg, args, stateFuncs) {
      if (+OPENAI_ENABLED) {
        if (!args || !args[0]) {
          error.usage("!paint [prompt]", msg);
          return;
        }
        
        const state = stateFuncs.getState();
        var sender = format.sentenceCase(state.playerKeys.filter(x => (msg.author.id == state.players[x].userId))[0]);
        const paintClient = paintConfig();

        const prompt = args.join(" ");
        console.log(new Date(), "[paint]: prompt:", prompt);

        try {
          let response = await paintClient.images.generate(
            {
              model: PAINT_MODEL,
              prompt: prompt
            }
          );

          const imageEmbed = new MessageEmbed()
            .setImage(response.data[0].url);

            console.log(new Date(), "[paint]: Response data:",response.data[0].revised_prompt);
            console.log(new Date(), "[paint]: ************** END Response data");

          msg.channel.send({embeds: [imageEmbed]});
          msg.reply(`${format.bold("DeathBot")} has painted for ${sender}:\n${response.data[0].revised_prompt}`);
        }
        catch(error) {
          msg.reply(`Unable to paint something like "${prompt}" for ${sender} - ${error.error}`);
        }
      } else {
          console.log(new Date(), "[paint]: AI disabled.");
      }
    },
};