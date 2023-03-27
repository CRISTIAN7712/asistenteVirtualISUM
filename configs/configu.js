require('dotenv').config()

const apiKeyGPT = ()=>{return process.env.OPENAI_API_KEY}



module.exports={apiKeyGPT};
