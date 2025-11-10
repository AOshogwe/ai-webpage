#LingoChain AI – Chat Interface

LingoChain AI is a lightweight, front-end prototype for an AI chat application inspired by ChatGPT’s conversational layout.  
It was developed as a design and interaction experiment to simulate how a user might engage with an AI mentor or assistant.

---

Features

- Three-Panel Layout — Navigation sidebar, chat list panel, and main chat area.  
- Local Storage Persistence — Saves all chat sessions locally in your browser.  
- Dynamic Chat Rendering — Messages, timestamps, and previews update in real time.  
- Modern UI Styling — Dark theme, gradient buttons, subtle animations, and smooth transitions.  
- Expandable API Hook — Pre-configured to connect to a local backend (default: `localhost:3000/api/chat`).

---

File Structure

LingoChainAI/
│
├── index.html # Core structure and layout
├── styles.css # Visual design, color system, and animations
├── script.js # Chat logic, localStorage, and event handling
└── README.md # Documentation (this file)


Setup Instructions

1. Clone or Download
```bash
git clone https://github.com/yourusername/lingochain-ai.git
cd lingochain-ai
2. Run Locally
Simply open index.html in your web browser:
open index.html
The app works entirely client-side — no build process required.

3. (Optional) Connect to a Local API
To enable AI responses:
npm install
Run your local API with:

npm start
By default, it serves on:
local API endpoint at http://localhost:3000/api/chat.

The API should accept a JSON payload:

{ "message": "Hello world" }
and return:

json
Copy code
{ "content": [{ "text": "Hello there!" }] }
If no server is running, the app will display a friendly error message and continue offline.

Use of AI in Development
This project was created and refined using AI-assisted coding.
Specifically:

All HTML elements, class names, and ID conventions were generated with the help of an AI model to maintain consistent naming and modular organization.

The CSS theme, including gradients, animations, and variable naming, was refactored using AI for visual polish and reusability.

The JavaScript logic for rendering messages, managing state, and interacting with localStorage was AI-generated, then manually reviewed and optimized for clarity and efficiency.

This workflow demonstrates how AI can accelerate the design and development of functional, human-like interfaces — serving as both a coding assistant and creative collaborator.

Design Notes
Built using Vanilla JS, HTML5, and CSS3 (no frameworks).

Styling follows a tokenized design system with CSS variables for easy theming.

Uses Bootstrap Icons CDN for scalable and lightweight vector icons.


Future Improvements
Implement full backend chat logic with an LLM API (e.g., OpenAI, Claude, Gemini).

Add user authentication and cloud-based chat saving.

Improve mobile responsiveness and collapsible sidebar transitions.


License
MIT License © 2025 Akpoghomeh Oshogwe

“Built with creativity and code — and a little help from AI.”
