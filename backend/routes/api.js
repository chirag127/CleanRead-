const express = require('express');
const router = express.Router();
const geminiService = require('../services/gemini');

// Summarize endpoint
router.post('/summarize', async (req, res) => {
  try {
    const { content, mode } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const summary = await geminiService.generateSummary(content, mode);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Clean endpoint (fallback)
router.post('/clean', (req, res) => {
  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // Server-side cleaning logic (fallback)
    // This is a simple implementation; the main cleaning happens in the content script
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');
    
    res.json({ cleaned });
  } catch (error) {
    console.error('Error cleaning content:', error);
    res.status(500).json({ error: 'Failed to clean content' });
  }
});

module.exports = router;
