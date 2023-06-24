const checker = require("../common/check-wiki");

exports.pollWiki = (stateFuncs, channel, isInitial) => {
  checker.checkWiki(stateFuncs, channel, isInitial);
};