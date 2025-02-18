# BreakItDown

BreakItDown is a personalized learning platform that breaks down complex topics into simple, digestible pieces. It provides a user-friendly interface for studying various subjects, saving flashcards, and integrating with Anki for enhanced learning experiences.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure user authentication using Auth0.
- **Personalized Learning**: Study various subjects and topics with personalized content.
- **Flashcards**: Save flashcards and view them in an ANKI-like interface.
- **Question and Answer Generation**: Automatically generate questions and answers using the Gemini API.
- **Anki Integration**: Add flashcards to Anki for enhanced learning.
- **History Tracking**: Track your study history and progress.

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/breakitdown.git
    cd breakitdown
    ```

2. **Install dependencies**:

    ```bash
    # For the backend
    cd Backend
    npm install

    # For the frontend
    cd ../Frontend
    npm install
    ```

3. **Set up environment variables**:

    Create a `.env` file in both the `Backend` directory and add the necessary environment variables.

    **Backend/.env**:
   ```env
    GEMINI_API_KEY=your_key_here
    GOOGLE_CLIENT_ID=your_key_here
    GOOGLE_CLIENT_SECRET=your_key_here
    MONGODB_URI=your_connection_string_here
    JWT_SECRET=your_secret_here
    AUTH0_ISSUER=your_issuer_here
    AUTH0_DOMAIN=your_domain_here
    AUTH0_AUDIENCE=your_audience_here
    PORT=your_port_here
    ```

4. **Start the development servers**:

    ```bash
    # Start the backend server
    cd Backend
    npm start

    # Start the frontend server
    cd ../Frontend
    npm run dev
    ```

## Usage

1. **Sign Up / Log In**: Use the Auth0 authentication to sign up or log in.
2. **Start Learning**: Enter the subject and topic you want to study and start learning.
3. **Save Flashcards**: Save important flashcards for future reference.
4. **View Flashcards**: Navigate to the saved flashcards and view them in an ANKI-like interface.
5. **Generate Questions and Answers**: Automatically generate questions and answers for your flashcards using the Gemini API.
6. **Add to Anki**: Add flashcards to Anki for enhanced learning.

## API Endpoints

### User Endpoints

- **GET /api/user/saved-cards**: Fetch saved flashcards for the authenticated user.
- **GET /api/user/flashcard/:id**: Fetch a specific flashcard by ID.
- **POST /api/user/card**: Save a new flashcard.
- **POST /api/user/history-save**: Save a flashcard to the user's history.

### Flashcard Endpoints

- **POST /api/generate-question-answer**: Generate a question and answer for a given flashcard content.

## Technologies Used

- **Frontend**: React, Tailwind CSS, Auth0
- **Backend**: Node.js, Express, MongoDB, Mongoose, Auth0
- **API Integration**: Gemini API, Anki

## Contributing

We welcome contributions to improve BreakItDown. To contribute, follow these steps:

1. **Fork the repository**.
2. **Create a new branch**:

    ```bash
    git checkout -b feature/your-feature-name
    ```

3. **Make your changes**.
4. **Commit your changes**:

    ```bash
    git commit -m "Add your commit message"
    ```

5. **Push to the branch**:

    ```bash
    git push origin feature/your-feature-name
    ```

6. **Create a pull request**.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
