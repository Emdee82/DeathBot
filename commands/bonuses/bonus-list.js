const format = require("../../common/format");
const error = require("../../common/error");

module.exports = {
  name: "!bonus-list",
  description: "List available bonuses",
  execute(msg, args, stateFuncs) {
    let bonusString = "";

    const addBonus = (name, description, points, key, url) => {
        bonusString = bonusString + "\n\n" + format.bold(name + " (+" + points + ")\n") + description + " (key: " + key + ")";
        if (url) {
            bonusString = bonusString + "\n" + format.italic(`(More details: ${url} )`);
        }
    }

    const printBonuses = (bonuses) => {
        let keys = Object.keys(bonuses);
        let count = 0;

        keys.forEach(key => {
            addBonus(bonuses[key].name, bonuses[key].description, bonuses[key].points, key, bonuses[key].url)            
            count = count + 1;
            if (count >= 5 && bonusString && bonusString !== "") {
                msg.channel.send(bonusString);
                bonusString = "";
                count = 0;
            }
        });
        
        if (bonusString && bonusString !== ""){
            msg.channel.send(bonusString);
            bonusString = "";
        }
    }

    const allowedArgs = ["all", "custom", "thirdparty"]

    if(!args || !args[0] || !allowedArgs.includes(args[0].toLowerCase())) {
        error.usage("!bonus-list [custom|thirdParty|all]", msg);
        return;
    }

    msg.channel.send(format.bold("The Available Bonuses"));

    const currentState = stateFuncs.getState();

    if (args[0].toLowerCase() === "all" || args[0].toLowerCase() === "custom") {
        printBonuses(currentState.bonuses);
    }

    if (args[0].toLowerCase() === "all" || args[0].toLowerCase() === "thirdparty") {
        printBonuses(currentState.thirdPartyBonuses);
    }
  },
};