const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateGeminiResponse = async(prompt) => {
    const model = genAI.getGenerativeModel({model: 'models/gemini-1.5-pro-latest'});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}