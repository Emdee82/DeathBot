const axios = require("axios");
const cheerio = require("cheerio");
const killer = require("./kill");
const url = process.env.DEATH_NOTIFICATION_URL;
const pattern = process.env.NOTIFICATION_SEARCH_PATTERN;

const checkList = (stateFuncs, entries, channel) => {
    const state = stateFuncs.getState();
    const celebKeys = Object.keys(state.celebs);

    celebKeys
        .filter(celeb => state.celebs[celeb].isAlive && !state.celebs[celeb].excludeFromAuto)
        .forEach(celeb => {
            entries.forEach(entry => {
                let searchTerms = state.celebs[celeb].aka;
                if (!searchTerms) {
                    searchTerms = state.celebs[celeb].name.split(" ");
                }

                if (searchTerms.every(term => entry.text.includes(term))) {
                  let blacklisted = false;
                  if (state.celebs[celeb].blacklist && state.celebs[celeb].blacklist.length > 0) {
                     state.celebs[celeb].blacklist.every(blk => {
                       let blacklistSearch = blk.split(" ");

                       if (blacklistSearch.every(term => entry.text.includes(term))) {
                          blacklisted = true;
                       }
                     });
                  }

                  if (!blacklisted) {
                    console.log(new Date(), "[poll-wiki]: Processing death notification - "+ state.celebs[celeb].name);
                    killer.kill(celeb, stateFuncs, (x) => channel.send(x), (entry.age >= 10 && entry.age < 120 ? entry.age : null))
                  }
                }
            });
        });
}

exports.checkWiki = (stateFuncs, channel, isInitial) => {
  axios
    .get(url)
    .then((response) => {
      const $ = cheerio.load(response.data);

      let entries = [];
      $(pattern)
        .each(function (i, el) {
            let text = $(this).text().replace(/\s\s+/g, ' ');
            let ageMatches = text.match(/\d+/);
            entries.push({ 
                text: text, 
                age: ageMatches ? ageMatches[0] : null
            });
        });

      // Check the list and process any hits
      checkList(stateFuncs, entries, channel);
      if(isInitial) {
        console.log(new Date(), "[poll-wiki]: Initial wiki poll complete.");
      }
    })
    .catch((e) => {
      console.log(new Date(), "[poll-wiki]: ERROR: ", e);
    });
}