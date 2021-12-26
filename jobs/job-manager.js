require('dotenv').config({ path: `../.env.${process.env.PROD ? "prod" : "dev"}` });
const poller = require("./poll-wiki")
const WIKI_POLLER_MINUTES = process.env.WIKI_POLLER_MINUTES;
const SAVE_STATE_MINUTES = process.env.SAVE_STATE_MINUTES;

const wikiJob = (stateFuncs, channel) => {
  setInterval(() => {
    poller.pollWiki(stateFuncs, channel);
  }, +WIKI_POLLER_MINUTES * 60 * 1000);
};

const stateSaver = (stateFuncs) => {
  setInterval(() => {
    stateFuncs.saveState();
  }, +SAVE_STATE_MINUTES * 60 * 1000);
};

exports.init = (stateFuncs, channel) => {
    // Initial polling on restart
    console.log(new Date(), "[death-bot]: Performing initial wiki poll...");
    poller.pollWiki(stateFuncs, channel, true);

    // Poll wiki & update death list
    wikiJob(stateFuncs, channel);

    // Save state periodically
    stateSaver(stateFuncs);
};
