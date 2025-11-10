const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

const API_KEY = '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';

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Proxy endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 1024,
                messages: [{ role: 'user', content: message }]
            })
        });
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});