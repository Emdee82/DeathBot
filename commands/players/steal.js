require("dotenv").config({
  path: `../.env.${process.env.PROD ? "prod" : "dev"}`,
});
const error = require("../../common/error");
const find = require("../../common/find");
const image = require("../../common/image-search");
const playerAdder = require("../../common/add-player");
const format = require("../../common/format");
const { MessageEmbed } = require("discord.js");
const PICK_LIMIT = process.env.PICK_LIMIT;
const STEAL_LIMIT = process.env.STEAL_LIMIT;
const PICK_CUTOFF_DATE = new Date(
  process.env.PICK_CUTOFF_DATE + "T23:59:59.999"
);
const STEAL_START_DATE = new Date(process.env.STEAL_START_DATE);
const ALLOW_SAME_PICK = process.env.ALLOW_SAME_PICK;
const PROTECT_CONSUMES_STEAL_ATTEMPT =
  process.env.PROTECT_CONSUMES_STEAL_ATTEMPT;

module.exports = {
  name: "!steal",
  description: "Steals a pick from another player",
  execute(msg, args, stateFuncs, channel) {
    if (+ALLOW_SAME_PICK) {
      msg.reply(
        `Cannot steal - same picks from multiple players are already allowed.`
      );
      return;
    }

    if (new Date() > PICK_CUTOFF_DATE) {
      msg.reply(
        `No new picks are accepted after ${PICK_CUTOFF_DATE.toDateString()}.`
      );
      return;
    }

    if (new Date() < STEAL_START_DATE) {
      msg.reply(
        `Picks cannot be stolen until ${STEAL_START_DATE.toDateString()}.`
      );
      return;
    }

    if (!args || !args[0]) {
      error.usage("!steal [name]", msg);
      return;
    }

    let playerId = find.findPlayerByDiscordId(msg.author.id, stateFuncs);
    if (!playerId) {
      let newUserId = msg.author.id;
      playerId = playerAdder.addPlayer(
        stateFuncs,
        msg,
        msg.author.username,
        newUserId
      );
      msg.channel.send(
        `Welcome to the game, ${format.bold(msg.author.username + "!")}`
      );
    }

    if (stateFuncs.getState().players[playerId].picks.length >= +PICK_LIMIT) {
      msg.reply(
        `You already have ${PICK_LIMIT} picks - please remove one first if you'd like to replace it.`
      );
      return;
    }

    if (stateFuncs.getState().players[playerId].stealCount >= +STEAL_LIMIT) {
      msg.reply(`You have exhausted all of your chances to steal.`);
      return;
    }

    let state = stateFuncs.getState();
    let celeb = find.findCeleb(args, null, stateFuncs, true);
    let celebName = args.join(" ");

    if (!celeb) {
      msg.reply(
        `${format.bold(celebName)} hasn't been added to the game at all yet.`
      );
      return;
    }

    celebName = state.celebs[celeb].name;

    if (!state.celebs[celeb].isAlive) {
      msg.reply(
        `${format.bold(
          celebName
        )} has already died - unable to steal scoring picks.`
      );
      return;
    }

    let player = { ...state.players[playerId] };
    if (player.picks.includes(celeb)) {
      msg.reply(
        "It looks like you're trying to steal your own pick - there's no need for that."
      );
      return;
    }

    if (!state.celebs[celeb].players.length > 0) {
      msg.reply(
        `${format.bold(celebName)} hasn't been picked by anyone to steal from!`
      );
      return;
    }
    let ownerId = state.celebs[celeb].players[0];
    let owner = { ...state.players[ownerId] };

    if (state.celebs[celeb].isProtected) {
      let msgSuffix = ".";
      if (+PROTECT_CONSUMES_STEAL_ATTEMPT) {
        msgSuffix = " - the chance to steal has been spent.";
        player.stealCount = player.stealCount ? ++player.stealCount : 1;
        stateFuncs.updatePlayer(playerId, player);
      }

      channel.send(
        `${format.bold(
          state.players[playerId].name
        )} tried to steal ${format.bold(
          celebName
        )}, but this pick was ${format.bold("protected")} by ${format.bold(
          owner.name
        )}${msgSuffix}`
      );
      return;
    }

    if (state.celebs[celeb].stolenFrom?.includes(playerId)) {
      let msgSuffix = ".";
      if (+PROTECT_CONSUMES_STEAL_ATTEMPT) {
        msgSuffix = " - the chance to steal has been spent.";
        player.stealCount = player.stealCount ? ++player.stealCount : 1;
        stateFuncs.updatePlayer(playerId, player);
      }

      channel.send(
        `${format.bold(
          state.players[playerId].name
        )} tried to steal ${format.bold(
          celebName
        )}, but this pick had previously been stolen from them and cannot be stolen back${msgSuffix}`
      );
      return;
    }

    // Remove pick from owning player
    owner.picks = owner.picks.filter((x) => x !== celeb);
    stateFuncs.updatePlayer(ownerId, owner);

    // Replace with the stealer
    player.picks = [...player.picks, celeb];
    player.stolenPicks ??= [];
    player.stolenPicks = [...player.stolenPicks, celeb];
    player.stealCount = player.stealCount ? player.stealCount++ : 1;
    stateFuncs.updatePlayer(playerId, player);

    let newCeleb = { ...state.celebs[celeb] };
    newCeleb.players = [playerId];
    newCeleb.stolenFrom = [...(newCeleb.stolenFrom ?? []), ownerId];
    stateFuncs.updateCeleb(celeb, newCeleb);

    channel.send(
      `${format.bold(state.players[playerId].name)} has stolen ${format.bold(
        celebName
      )} from ${format.bold(owner.name)}!`
    );

    image.getImage(celebName).then((imgPath) => {
      const imageEmbed = new MessageEmbed().setImage(imgPath);

      channel.send({ embeds: [imageEmbed] });
    });
  },
};
