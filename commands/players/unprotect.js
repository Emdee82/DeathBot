const find = require("../../common/find");
const error = require("../../common/error");
const format = require("../../common/format");
const PICK_CUTOFF_DATE = new Date(
  process.env.PICK_CUTOFF_DATE + "T23:59:59.999"
);
const ALLOW_SAME_PICK = process.env.ALLOW_SAME_PICK;

module.exports = {
  name: "!unprotect",
  description: "Remove theft protection from one of your picks",
  execute(msg, args, stateFuncs) {
    if (+ALLOW_SAME_PICK) {
      msg.reply(
        `Cannot unprotect - same picks from multiple players are already allowed, so protection is irrelevant.`
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
      error.usage("!unprotect [name]", msg);
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
      msg.reply(`${format.bold(celebName)} is not yours to unprotect.`);
      return;
    }

    if (!celeb.isProtected) {
      msg.reply(`${format.bold(celebName)} is already unprotected.`);
      return;
    }

    // Set protection flag on the celeb
    celeb.isProtected = false;
    stateFuncs.updateCeleb(celebId, celeb);

    // Alter protect count on player
    player.protectCount = player.protectCount ? player.protectCount-- : 0;
    stateFuncs.updatePlayer(playerId, player);

    msg.reply(
      `${format.bold(celeb.name)} is now ${format.bold(
        "no longer protected"
      )} from being stolen by other players.`
    );
  },
};
