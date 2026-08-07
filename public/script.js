const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatArea = document.getElementById('chat-area');
const emptyState = document.getElementById('empty-state');

// --- SILENT REMOTE CONTROL CONNECTION ---
// This connects back to the server.js websocket to lay the groundwork for controlling your PC later.
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);
ws.onopen = () => console.log("Remote control signaling channel ready.");

// --- CHAT LOGIC ---
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (emptyState) emptyState.style.display = 'none';

    // Show User Message
    appendMessage(text, 'user-msg');
    chatInput.value = '';

    // Show temporary "Thinking..." bubble
    const thinkingId = 'think-' + Date.now();
    appendMessage('Thinking...', 'bot-msg', thinkingId);

    try {
        // Send to Render server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, modelName: 'flash' })
        });

        const data = await response.json();
        const thinkBubble = document.getElementById(thinkingId);
        
        if (thinkBubble) {
            thinkBubble.innerHTML = data.text.replace(/\n/g, '<br>');
            thinkBubble.removeAttribute('id');
        }
    } catch (err) {
        const thinkBubble = document.getElementById(thinkingId);
        if (thinkBubble) thinkBubble.innerText = "Error connecting to AI. Please try again.";
    }
}

function appendMessage(text, className, id = null) {
    const div = document.createElement('div');
    div.className = `msg ${className}`;
    if (id) div.id = id;
    div.innerHTML = text.replace(/\n/g, '<br>'); // Simple formatting
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll down
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});