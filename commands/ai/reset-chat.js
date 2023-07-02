module.exports = {
    name: '!reset-chat',
    description: 'Resets the ChatGPT history as a break-glass in case of token overflow.',
    restrictionLevel: 2,
    execute(msg, args, stateFuncs) {
      stateFuncs.initMessages();
      msg.reply('Chat messages reset.');
      console.log(new Date(), "[reset-chat]: Chat messages reset.");
    },
};