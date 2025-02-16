const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const cardStudiedSchema = new mongoose.Schema({
  dateStudied: {
    type: Date,
    required: true,
  },
  numberOfCards: {
    type: Number,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  picture: String,
  lastLogin: Date,
  // Add any additional fields you want to store
  createdAt: {
    type: Date,
    default: Date.now,
  },

  history: [
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      learnedAt: { type: Date, default: Date.now },
    },
  ],

  cards: [cardSchema],
  cardsStudied: {
    type: Map,
    of: {
      dateStudied: {
        type: Date,
        required: true,
      },
      numberOfCards: {
        type: Number,
        required: true,
      },
    },
  },
  // Embedding cardSchema as a sub-collection

});

module.exports = mongoose.model("User", userSchema);
