const chatInput = document.getElementById('chat-input');
const chatArea = document.getElementById('chat-area');
const mainContent = document.getElementById('main-content');
const welcomeMessage = document.getElementById('welcome-message');

let isFirstMessage = true;

// Connect to background websocket for future PC control
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);
ws.onopen = () => console.log("Remote control signaling channel ready.");

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // The magic transition: Drop the bar to the bottom and show chat
    if (isFirstMessage) {
        isFirstMessage = false;
        mainContent.classList.remove('home-state');
        welcomeMessage.style.display = 'none';
        chatArea.style.display = 'flex';
    }

    // Show User Message
    appendMessage('You:', text, 'user-msg');
    chatInput.value = '';

    // Show temporary "Thinking..." text
    const thinkingId = 'think-' + Date.now();
    appendMessage('ChudBot:', '...', 'bot-msg', thinkingId);

    try {
        // Send to server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, modelName: 'flash' })
        });

        const data = await response.json();
        const thinkBubble = document.getElementById(thinkingId);
        
        if (thinkBubble) {
            thinkBubble.innerHTML = `<strong>ChudBot:</strong><br><br>${data.text.replace(/\n/g, '<br>')}`;
            thinkBubble.removeAttribute('id');
        }
    } catch (err) {
        const thinkBubble = document.getElementById(thinkingId);
        if (thinkBubble) thinkBubble.innerHTML = "<strong>ChudBot:</strong><br><br>Error connecting to brain. Check API key on Render.";
    }
}

function appendMessage(sender, text, className, id = null) {
    const div = document.createElement('div');
    div.className = `msg ${className}`;
    if (id) div.id = id;
    
    // Formats it exactly like the image: "You:" or "ChudBot:" above the text
    div.innerHTML = `<strong>${sender}</strong><br><br>${text.replace(/\n/g, '<br>')}`;
    
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight; 
}

// Pressing Enter sends the message (since we removed the send button)
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        sendMessage();
    }
});
