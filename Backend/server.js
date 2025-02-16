require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User"); // Import User model
const datageneration = require("./datageneration"); // Import function properly
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

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Test the server at http://localhost:${port}/test`);
});

// Error handling for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
