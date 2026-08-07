require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);

// 1. Serve the frontend UI files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. Setup Gemini AI Chat
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, modelName } = req.body;
        
        // Use flash model as requested in the UI dropdown
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "Your name is ChudBot. You are a helpful, conversational AI assistant. Keep responses natural and concise."
        });

        const chatSession = model.startChat({ history: [] });
        const result = await chatSession.sendMessage(prompt);
        const responseText = result.response.text();

        res.json({ success: true, text: responseText });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, text: "Error connecting to brain. Check API key." });
    }
});

// 3. SILENT PC REMOTE CONTROL GROUNDWORK (Hidden from UI)
// This WebSocket server runs on the same port and waits for your desktop to connect in the future.
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    console.log('Silent connection established for future remote control.');
    ws.on('message', (message) => {
        // Future logic for mouse/keyboard routing goes here
    });
});

// 4. Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`ChudBot Web is live on port ${PORT}`);
});