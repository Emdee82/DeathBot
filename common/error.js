const format = require("./format")

exports.usage = (message, msg) => {
    msg.channel.send(format.bold("Usage:\n"+format.codeBlock(message)));
}