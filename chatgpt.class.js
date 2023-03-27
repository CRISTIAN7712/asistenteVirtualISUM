const { Configuration, OpenAIApi } = require("openai");
const apiKeyGPT=require('./configs/configu')
//require('dotenv').config()
//console.log('h');
const configuration = new Configuration({
    apiKey: apiKeyGPT.apiKeyGPT(),
});

//sconsole.log(configuration);
const openai = new OpenAIApi(configuration);

async function runCompletion (message) {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: message,
        max_tokens: 200,
        temperature: 0.9,
        top_p: 0.8,
        //n: 100, 
    });
    return completion.data.choices[0].text;
}

module.exports={runCompletion}