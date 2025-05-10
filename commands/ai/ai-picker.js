const OpenAI = require("openai");
const aiFuncs = require("./open-api");
const aiConstants = require("./ai-constants");
const OPENAI_ENABLED = process.env.OPENAI_ENABLED;
const GPT_KEY = process.env.OPENAI_GPT_API_KEY;
const GROK_KEY = process.env.OPENAI_GROK_API_KEY;
const GPT_MODEL = process.env.OPENAI_GPT_MODEL;
const GROK_MODEL = process.env.OPENAI_GROK_MODEL;
const GROK_URL = process.env.OPENAI_GROK_URL;

const configureOpenApi = (config) => {
    if (!config.apiKey) {
        console.error("OpenAI API key not configured");
        msg.reply("Open AI configuration missing. Get Mike to fix it.");
        return;
    }
    const configuration = new OpenAI.Configuration(config);

    return new OpenAI.OpenAIApi(configuration);
};

const grokConfig = () => {
    return configureOpenApi({
        apiKey: GROK_KEY,
        basePath: GROK_URL,
    });
};

const gptConfig = () => {
    return configureOpenApi({
        apiKey: GPT_KEY,
    });
};

const pickAi = (stateFuncs, msg) => {
    const model = stateFuncs.getState().aiModel;
    switch (model) {
        case aiConstants.aiModels.GPT:
            aiFuncs.openApi(stateFuncs, msg, gptConfig(), GPT_MODEL);
            break;
        case aiConstants.aiModels.GROK:
            aiFuncs.openApi(stateFuncs, msg, grokConfig(), GROK_MODEL);
            break;
        default:
            const output = `Invalid AI model currently selected: ${model}`;
            msg.reply(output);
            console.error(output);
            break
    }
};

exports.aiPicker = async (stateFuncs, msg) => {
    if (+OPENAI_ENABLED) {
        pickAi(stateFuncs, msg);
    } else {
        console.log(new Date(), "[ai-picker]: ChatGPT disabled.");
    }
};
