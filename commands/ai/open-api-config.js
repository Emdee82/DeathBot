const OpenAI = require("openai");

exports.configureOpenApi = (config) => {
    if (!config.apiKey) {
        console.error("OpenAI API key not configured");
        msg.reply("Open AI configuration missing. Get Mike to fix it.");
        return;
    }
    const configuration = new OpenAI(config);

    return configuration;
};
