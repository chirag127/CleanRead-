const { GoogleGenerativeAI } = require("@google/generative-ai");

// Function to chunk text for API limits
const chunkText = (text, maxLength = 4000) => {
    if (text.length <= maxLength) return [text];

    const chunks = [];
    let currentChunk = "";
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length <= maxLength) {
            currentChunk += sentence + " ";
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = sentence + " ";
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};

// Initialize Gemini API
const initializeGemini = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    return new GoogleGenerativeAI(apiKey);
};

// Generate summary using Gemini API
const generateSummary = async (content, mode = "tldr") => {
    try {
        // Clean and prepare content
        const cleanedContent = content
            .replace(/<[^>]*>/g, " ") // Remove HTML tags
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim();

        // Chunk content for API limits
        const chunks = chunkText(cleanedContent);

        // Generate prompts based on mode
        let prompt;
        switch (mode) {
            case "bullets":
                prompt = `Summarize the following text in 5-7 bullet points:\n\n${chunks[0]}`;
                break;
            case "key":
                prompt = `Extract 3-5 key takeaways from the following text:\n\n${chunks[0]}`;
                break;
            case "tldr":
            default:
                prompt = `Provide a concise TL;DR summary (1-2 sentences) of the following text:\n\n${chunks[0]}`;
        }

        // Initialize Gemini API
        const genAI = initializeGemini();

        // Get the model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
        });

        // Set generation config
        const generationConfig = {
            temperature: 0.2,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 800,
            responseMimeType: "text/plain",
        };

        // Start chat session
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        // Send message and get response
        const result = await chatSession.sendMessage(prompt);

        // Extract and return summary
        const summary = result.response.text();
        return summary;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate summary");
    }
};

module.exports = {
    generateSummary,
};
