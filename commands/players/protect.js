const find = require("../../common/find");
const error = require("../../common/error");
const format = require("../../common/format");
const PICK_CUTOFF_DATE = new Date(
  process.env.PICK_CUTOFF_DATE + "T23:59:59.999"
);
const ALLOW_SAME_PICK = process.env.ALLOW_SAME_PICK;
const PROTECT_LIMIT = process.env.PROTECT_LIMIT;
const image = require("../../common/image-search");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "!protect",
  description: "Protect a celeb by name or ID",
  execute(msg, args, stateFuncs) {
    if (+ALLOW_SAME_PICK) {
      msg.reply(
        `Cannot protect - same picks from multiple players are already allowed.`
      );
      return;
    }

    if (new Date() > PICK_CUTOFF_DATE) {
      msg.reply(
        `No pick adjustments are accepted after ${PICK_CUTOFF_DATE.toDateString()}.`
      );
      return;
    }

    if (!args || !args[0]) {
      error.usage("!protect [name]", msg);
      return;
    }

    let state = stateFuncs.getState();
    let celebName = args.join(" ");
    let celebId = find.findCeleb(args, msg, stateFuncs, true);
    if (!celebId) {
      msg.reply(
        `${format.bold(celebName)} hasn't been added to the game at all yet.`
      );
      return;
    }

    let celeb = state.celebs[celebId];
    celebName = celeb.name;
    let playerId = find.findPlayerByDiscordId(msg.author.id, stateFuncs);
    let player = { ...state.players[playerId] };

    if (!player.picks.includes(celebId)) {
      msg.reply(`${format.bold(celebName)} is not yours to protect.`);
      return;
    }

    if (celeb.isProtected) {
      msg.reply(`${format.bold(celebName)} is already protected.`);
      return;
    }

    if (!celeb.isAlive) {
      msg.reply(
        `${format.bold(
          celebName
        )} has already died and can no longer be protected.`
      );
      return;
    }

    if (
      stateFuncs.getState().players[playerId].protectCount >= +PROTECT_LIMIT
    ) {
      msg.reply(
        `You have already protected as many picks as you are allowed.\nYou can first remove protection from another with \`!unprotect [name]\` if you've changed your mind..`
      );
      return;
    }

    // Set protection flag on the celeb
    celeb.isProtected = true;
    stateFuncs.updateCeleb(celebId, celeb);

    // Alter protect count on player
    player.protectCount = player.protectCount ? player.protectCount++ : 1;
    stateFuncs.updatePlayer(playerId, player);

    msg.reply(
      `${format.bold(celeb.name)} is now ${format.bold(
        "protected"
      )} from being stolen by other players.`
    );

    image.getImage(celebName).then((imgPath) => {
      const imageEmbed = new MessageEmbed().setImage(imgPath);

      msg.channel.send({ embeds: [imageEmbed] });
    });
  },
};
