require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const User = require("./models/User"); // Import User model
const datageneration = require("./datageneration"); // Import function
const axios = require("axios");
const { Parser } = require("json2csv");
const AnkiExport = require("anki-apkg-export").default;
// properly
const {
  addFlashcardToAnki,
  generateBackContent,
  model,
  generateFrontContent,
} = require("./ankiService");
const { auth } = require("express-oauth2-jwt-bearer");

const app = express();
const port = process.env.PORT || 3000;
// Middleware - Order is important!
app.use(express.json()); // This needs to come before routes

app.use(cors({ origin: "https://breakitdown-app.netlify.app" }));
// const allowedOrigins = [
//   "http://localhost:5173", // Local Development
//   "https://breakitdown-app.netlify.app", // Netlify Frontend
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true, // Needed if using authentication (cookies, JWT, etc.)
//   })
// );

// // Handle preflight requests explicitly
// app.options("*", cors());
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
app.get("/", (req, res) => {
  res.send("Server is running and the / route is working!");
});
// Create or update user after successful Auth0 login
app.post("/api/user", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub; // Get Auth0 ID from token
    const { email, name, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let user = await User.findOne({ auth0Id });

    if (user) {
      user.email = email;
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        auth0Id,
        email,
        name,
        picture,
        lastLogin: new Date(),
        cardsStudied: new Map(),
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

app.get("/api/userDetails", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await User.findOne({ auth0Id }).select("name picture email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});
app.get("/api/cardsStudied", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await User.findOne({ auth0Id }).select("cardsStudied");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert Map to an object for easier handling
    const cardsStudiedObj = Object.fromEntries(user.cardsStudied);
    res.json(cardsStudiedObj);
  } catch (error) {
    console.error("Error fetching cards studied:", error);
    res.status(500).json({ error: "Failed to fetch cards studied" });
  }
});

app.post("/api/increase-cards-studied", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure cardsStudied is initialized
    if (!user.cardsStudied) {
      user.cardsStudied = new Map(); // Initialize if undefined
    }

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    // Check if the entry for today exists
    if (user.cardsStudied.has(today)) {
      // If it exists, increment the number of cards
      user.cardsStudied.get(today).numberOfCards += 1;
    } else {
      // If it doesn't exist, create a new entry
      user.cardsStudied.set(today, {
        dateStudied: new Date(),
        numberOfCards: 1,
      });
    }

    await user.save();
    res.status(200).json({ message: "Cards studied increased successfully" });
  } catch (error) {
    console.error("Error increasing cards studied:", error);
    res.status(500).json({ message: "Failed to increase cards studied" });
  }
});

app.post("/api/generate-back", async (req, res) => {
  try {
    const { front } = req.body;
    if (!front)
      return res.status(400).json({ error: "Front content is required" });

    const back = await generateBackContent(front);

    res.json({ back: back.trim() || "Explanation not available." });
  } catch (error) {
    console.error("❌ Error generating back content:", error);
    res.status(500).json({ error: "Failed to generate back content" });
  }
});

app.post("/api/generate-front", async (req, res) => {
  try {
    const { fq } = req.body;
    if (!fq)
      return res.status(400).json({ error: "Front content is required" });

    const front = await generateFrontContent(fq);

    res.json({ front: front.trim() || "Explanation not available." });
  } catch (error) {
    console.error("❌ Error generating front content:", error);
    res.status(500).json({ error: "Failed to generate front content" });
  }
});

app.get("/api/user/saved-cards", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub; // Get Auth0 ID from token

    // Find the user
    let user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ cards: user.cards });
  } catch (error) {
    console.error("Error fetching saved cards:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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

    // Convert flashcard to CSV
    const fields = ["title", "content"];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(user.cards);

    console.log("Converted flashcards to CSV:", csv);

    // Generate ANKI cards
    const ankiDeck = new AnkiExport("My Deck");
    user.cards.forEach((card) => {
      ankiDeck.addCard(card.title, card.content);
    });

    const zip = await ankiDeck.save();
    const zipPath = `./decks/${user._id}.apkg`;
    fs.writeFileSync(zipPath, zip);

    console.log("Generated ANKI deck:", zipPath);

    // Save to ANKI using ANKI Connect API
    const ankiConnectResponse = await axios.post("http://localhost:8765", {
      action: "importPackage",
      version: 6,
      params: {
        path: zipPath,
      },
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
app.post("/api/anki/add", checkJwt, async (req, res) => {
  try {
    let { front, back } = req.body;
    if (!front)
      return res.status(400).json({ error: "Front field is required" });

    // If back is missing, generate it first
    if (!back || back.trim() === "") {
      console.log("🔄 Generating question for flashcard...");
      const genResponse2 = await fetch(
        "https://breakitdown-psi.vercel.app/api/generate-front",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front }),
        }
      );
      console.log("🔄 Generating missing back content...");
      const genResponse = await fetch(
        "https://breakitdown-psi.vercel.app/api/generate-back",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front }),
        }
      );

      if (!genResponse2.ok) throw new Error("Failed to generate question");
      if (!genResponse.ok) throw new Error("Failed to generate back content");
      const genResult = await genResponse.json();
      back = genResult.back;
      const genResult2 = await genResponse2.json();
      front = genResult2.front;
    }

    // Save to Anki
    const response = await addFlashcardToAnki(front, back);
    if (response?.result) {
      res.json({
        success: true,
        message: "✅ Flashcard added to Anki",
        result: response.result,
      });
    } else {
      res.status(500).json({ error: "❌ Failed to add flashcard to Anki" });
    }
  } catch (error) {
    console.error("❌ Anki Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/user/history-save", checkJwt, async (req, res) => {
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

    // Add the new card to the user's history
    user.history.push({ title, content });
    if (user.history.length > 15) {
      user.history.shift(); // Remove the oldest card if history exceeds 15 cards
    }
    await user.save();

    console.log("Saved card to history for user:", user);

    res.json(user);
  } catch (error) {
    console.error("Error saving card to history:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.get("/api/user/history", checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
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
// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Test the server at http://localhost:${port}/test`);
});

// Error handling for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
