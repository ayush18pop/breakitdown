const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function generateBackContent(front) {
  try {
    const prompt = `Provide a detailed but effective explanation for the following learning prompt in under 50 words:
    
    "${front}"`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    return responseText.replace(/```json|```/g, "").trim();
  } catch (error) {
    console.error("❌ Error generating back content:", error);
    return "Explanation not available.";
  }
}

async function generateFrontContent(front) {
  try {
    const prompt = `Provide a question out of this information, a short question for active recall:
    
    "${front}"`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    return responseText.replace(/```json|```/g, "").trim();
  } catch (error) {
    console.error("❌ Error generating front content:", error);
    return "Explanation not available.";
  }
}

async function addFlashcardToAnki(front) {
  try {
    const back = await generateBackContent(front); // Generate the back dynamically
    const fq = await generateFrontContent(front);
    const response = await axios.post("http://localhost:8765", {
      action: "addNote",
      version: 6,
      params: {
        note: {
          deckName: "Default",
          modelName: "Basic",
          fields: { Front: fq, Back: back },
          options: { allowDuplicate: false },
          tags: ["flashcards"],
        },
      },
    });

    console.log("✅ Flashcard added to Anki:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Anki Error:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

module.exports = {
  addFlashcardToAnki,
  generateBackContent,
  model,
  generateFrontContent,
};
