require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function generateResponse(message) {
  const prompt = `Respond to the following message: "${message}"`;

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();
  const cleanedText = responseText.replace(/```json|```/g, "").trim();
  console.log(cleanedText);
  return cleanedText;
}

module.exports = generateResponse;