# CleanRead

CleanRead is a browser extension that transforms cluttered, fluff-filled web articles into a clean, concise, and distraction-free reading experience. It auto-detects and removes clickbait, SEO padding, irrelevant content, and ads, while summarizing the core content using AI.

## Features

-   **Clean Mode**: Removes fluff, ads, sidebars, popups, and non-essential sections.
-   **AI Summarization**: Generates concise summaries of articles using Gemini 2.0 Flash Lite.
-   **Multiple Summary Modes**: TL;DR, bullet points, or key takeaways.
-   **Read Time Estimation**: Shows approximately how long it will take to read the article.
-   **Customizable**: Adjust text size, choose light or dark theme, and set auto-clean preferences.

## Installation

### Chrome/Edge

1. Clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions` or `edge://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder from this repository

### Firefox

1. Clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on" and select the `manifest.json` file from the `extension` folder

## Backend Setup

The extension requires a backend server for AI summarization:

1. Navigate to the `backend` folder
2. Create a `.env` file with your Gemini API key:
    ```
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
3. Install dependencies:
    ```
    npm install
    ```
4. Start the server:
    ```
    npm start
    ```

## Usage

1. Click the CleanRead extension icon in your browser toolbar
2. Use the "Clean Page" button to remove distractions
3. Use the "Summarize" button to generate an AI summary
4. Toggle between original, clean, and summary views
5. Adjust settings as needed

## Development

### Frontend

The extension is built using HTML, CSS, and JavaScript with Manifest V3.

### Backend

The backend is built with Node.js and Express.js, using the Gemini 2.0 Flash Lite API for summarization.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
