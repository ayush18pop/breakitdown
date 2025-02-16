require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const { Parser } = require("json2csv");
const AnkiExport = require("anki-apkg-export").default;
const User = require("./models/User"); // Import User model
const datageneration = require("./datageneration"); // Import function 
const { addFlashcardToAnki, generateBackContent, model } = require("./ankiService");
const { auth } = require("express-oauth2-jwt-bearer");

const app = express();
const port = 3000;

// Middleware - Order is important!
app.use(express.json()); // This needs to come before routes
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    // Drop the problematic index
    await mongoose.connection
      .collection("users")
      .dropIndex("username_1")
      .catch((err) => console.log("Index might not exist:", err.message));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Add this middleware to debug token issues
app.use((req, res, next) => {
  console.log("Auth Header:", req.headers.authorization);
  next();
});

// Define an API route
app.get("/api/data", checkJwt, async (req, res) => {
  try {
    const subject = req.headers["subject"];
    const topic = req.headers["topic"];
    const additionalReq = req.headers["additionalReq"];
    const content = await datageneration(subject, topic, additionalReq); // Get data
    const jsonData = JSON.parse(content); // Convert string to JSON
    res.json(jsonData); // Send proper JSON response
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating content" });
  }
});

// Create or update user after successful Auth0 login
app.post("/api/user", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub; // Get Auth0 ID from token
    const { email, name, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // First try to find the user
    let user = await User.findOne({ auth0Id });

    if (user) {
      // Update existing user
      user.email = email;
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        auth0Id,
        email,
        name,
        picture,
        lastLogin: new Date(),
      });
      await user.save();
    }

    console.log("Updated/Created user:", user);
    res.json(user);
  } catch (error) {
    console.error("Server error details:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.post("/api/generate-back", async (req, res) => {
  try {
    const { front } = req.body;
    if (!front) return res.status(400).json({ error: "Front content is required" });

    const back = await generateBackContent(front);

    res.json({ back: back.trim() || "Explanation not available." });
  } catch (error) {
    console.error("❌ Error generating back content:", error);
    res.status(500).json({ error: "Failed to generate back content" });
  }
});

app.post("/api/user/card", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub; // Get Auth0 ID from token
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Find the user
    let user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the new card to the user's cards sub-collection
    user.cards.push({ title, content });
    await user.save();

    console.log("Saved card for user:", user);

    user.history.push({ title, content });
    if (user.history.length > 15) {
      user.history.shift(); // Remove the oldest card if history exceeds 15 cards
    }
    await user.save();

    console.log("Updated history for user:", user.history);
    // Convert flashcard to CSV
    const fields = ['title', 'content'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(user.cards);

    console.log("Converted flashcards to CSV:", csv);

    // Generate ANKI cards
    const ankiDeck = new AnkiExport('My Deck');
    user.cards.forEach(card => {
      ankiDeck.addCard(card.title, card.content);
    });

    const zip = await ankiDeck.save();
    const zipPath = `./decks/${user._id}.apkg`;

    // Ensure the decks directory exists
    const decksDir = './decks';
    if (!fs.existsSync(decksDir)) {
      fs.mkdirSync(decksDir);
    }

    fs.writeFileSync(zipPath, zip);

    console.log("Generated ANKI deck:", zipPath);

    // Save to ANKI using ANKI Connect API
    const ankiConnectResponse = await axios.post('http://localhost:8765', {
      action: 'importPackage',
      version: 6,
      params: {
        path: zipPath
      }
    });

    console.log("Saved deck to ANKI:", ankiConnectResponse.data);

    res.json(user);
  } catch (error) {
    console.error("Server error details:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
app.get("/api/user/history", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub; // Get Auth0 ID from token
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ history: user.history });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});
app.post("/api/anki/add", checkJwt, async (req, res) => {
  try {
    let { front, back } = req.body;
    if (!front) return res.status(400).json({ error: "Front field is required" });

    // If back is missing, generate it first
    if (!back || back.trim() === "") {
      console.log("🔄 Generating missing back content...");
      const genResponse = await fetch("http://localhost:3000/api/generate-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front }),
      });

      if (!genResponse.ok) throw new Error("Failed to generate back content");
      const genResult = await genResponse.json();
      back = genResult.back;
    }

    // Save to Anki
    const response = await addFlashcardToAnki(front, back);
    if (response?.result) {
      res.json({ success: true, message: "✅ Flashcard added to Anki", result: response.result });
    } else {
      res.status(500).json({ error: "❌ Failed to add flashcard to Anki" });
    }
  } catch (error) {
    console.error("❌ Anki Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Test the server at http://localhost:${port}/test`);
});

// Error handling for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});