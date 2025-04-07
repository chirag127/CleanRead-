const axios = require('axios');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// Function to chunk text for API limits
const chunkText = (text, maxLength = 4000) => {
  if (text.length <= maxLength) return [text];
  
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += sentence + ' ';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// Generate summary using Gemini API
const generateSummary = async (content, mode = 'tldr') => {
  try {
    // Clean and prepare content
    const cleanedContent = content
      .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
    
    // Chunk content for API limits
    const chunks = chunkText(cleanedContent);
    
    // Generate prompts based on mode
    let prompt;
    switch (mode) {
      case 'bullets':
        prompt = `Summarize the following text in 5-7 bullet points:\n\n${chunks[0]}`;
        break;
      case 'key':
        prompt = `Extract 3-5 key takeaways from the following text:\n\n${chunks[0]}`;
        break;
      case 'tldr':
      default:
        prompt = `Provide a concise TL;DR summary (1-2 sentences) of the following text:\n\n${chunks[0]}`;
    }
    
    // Call Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      }
    );
    
    // Extract and return summary
    const summary = response.data.candidates[0].content.parts[0].text;
    return summary;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate summary');
  }
};

module.exports = {
  generateSummary
};
