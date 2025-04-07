
## 🧼 CleanRead – PRD (Product Requirements Document)

### 📌 Overview
**CleanRead** is a browser extension that transforms cluttered, fluff-filled web articles into a clean, concise, and distraction-free reading experience. It auto-detects and removes clickbait, SEO padding, irrelevant content, and ads, while summarizing the core content using AI.

---

### 🎯 Goals
- **Improve readability** by stripping away filler and distractions.
- **Boost comprehension** through AI-powered TL;DR summaries.
- **Save time** with estimated read times and key-point extraction.
- **Maintain privacy**: process summaries securely via backend AI.

---

### 🧱 Project Structure
```
root/
│
├── extension/           # Frontend browser extension code
│   ├── manifest.json
│   ├── popup.html
│   ├── styles.css
│   ├── contentScript.js
│   └── background.js
│
├── backend/             # Express.js backend with Gemini 2.0 Flash Lite integration
│   ├── server.js
│   ├── routes/
│   └── services/gemini.js
│
└── README.md
```

---

### 🖥️ Frontend (Browser Extension)
#### Tech Stack
- Manifest V3 (compatible with Chrome, Edge, Firefox, Safari)
- HTML/CSS/JavaScript

#### Features
- 🧹 **Auto-clean page button:** Injects script to remove distractions.
- ✂️ **Decrapify Engine:** Strips banners, ads, popups, footers, comment sections.
- 🧠 **Summarize with AI:** Sends article body to backend for TL;DR and returns it.
- ⏱️ **Read Time Estimate:** Calculates and displays approximate time needed to read the cleaned article.
- 📝 **Sidebar Output:** Shows cleaned content, summary, and original side-by-side.

---

### 🧠 Backend (AI + Logic)
#### Tech Stack
- Node.js + Express.js
- Gemini 2.0 Flash Lite API

#### API Endpoints
- `POST /summarize`: Accepts article body, returns TL;DR summary.
- `POST /clean`: Optionally performs additional server-side cleaning (fallback).

#### Summary Logic
- Remove HTML tags, scripts, irrelevant divs
- Chunk cleaned text and pass to Gemini Flash Lite
- Return concise summary with key points (optional: Markdown format)

---

### 🤖 ML Integration
- **Model:** Gemini 2.0 Flash Lite
- **Purpose:** Generate short summaries, key takeaways
- **Input:** Cleaned article content (max token limit handled)
- **Output:** 3 modes:
  1. TL;DR summary (1–2 sentences)
  2. Bullet points
  3. Key takeaways

---

### 🧪 Features (MVP)
| Feature | Description |
|--------|-------------|
| Clean Mode | Removes fluff: ads, sidebars, popups, and non-essential sections. |
| Summarize Button | Sends visible content to backend, gets Gemini-generated TL;DR. |
| Toggle View | Switch between raw, cleaned, and summary views. |
| Auto Estimate | Shows "Estimated Read Time: X mins". |
| Customizable | User settings: text size, theme (light/dark), reading mode on new tabs. |

---

### 📅 Milestones
| Milestone | Deliverable |
|----------|-------------|
| Week 1 | Extension UI + core decrapifier (content script) |
| Week 2 | Backend with Gemini API integration |
| Week 3 | Summary view integration + sidebar |
| Week 4 | Cross-browser packaging (Chrome, Edge, Firefox, Safari) |
| Week 5 | Testing + Release on Web Stores |

---

### 🛠️ Future Enhancements
- 🔄 **Auto-refresh summaries** on dynamic pages (e.g., Medium, blogs).
- 🎙️ **TTS Mode**: Read summaries aloud with setting in the popup to channge voices, speed, pitch .
- 📥 **Save as Markdown/PDF**: For offline reading.
