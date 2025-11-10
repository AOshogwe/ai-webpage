// ===========================
// CONFIGURATION
// ===========================
const API_URL = 'http://localhost:3000/api/chat';

// ===========================
// STATE MANAGEMENT
// ===========================
let chats = [];
let currentChatId = null;
let isLoading = false;

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    loadChatsFromStorage();
    updateUI();
    
    // If no chats exist, create a default one
    if (chats.length === 0) {
        createNewChat();
    } else {
        // Load the most recent chat
        currentChatId = chats[0].id;
        renderMessages(chats[0].messages);
    }
    
    renderChatsList();
});

// ===========================
// STORAGE FUNCTIONS
// ===========================
function loadChatsFromStorage() {
    try {
        const saved = localStorage.getItem('lingochainChats');
        if (saved) {
            chats = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        chats = [];
    }
}

function saveChatsToStorage() {
    try {
        localStorage.setItem('lingochainChats', JSON.stringify(chats));
    } catch (error) {
        console.error('Error saving chats:', error);
    }
}

// ===========================
// CHAT MANAGEMENT
// ===========================
function createNewChat() {
    const newChat = {
        id: Date.now(),
        title: 'New Conversation',
        messages: [],
        timestamp: new Date().toISOString()
    };
    
    chats.unshift(newChat);
    currentChatId = newChat.id;
    
    saveChatsToStorage();
    renderChatsList();
    renderMessages([]);
    updateUI();
    
    // Focus input
    document.getElementById('messageInput').focus();
}

function switchChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        currentChatId = chatId;
        renderMessages(chat.messages);
        renderChatsList();
        updateUI();
    }
}

function deleteChat(chatId, event) {
    event.stopPropagation();
    
    if (!confirm('Delete this chat?')) return;
    
    chats = chats.filter(c => c.id !== chatId);
    
    if (currentChatId === chatId) {
        if (chats.length > 0) {
            currentChatId = chats[0].id;
            renderMessages(chats[0].messages);
        } else {
            currentChatId = null;
            createNewChat();
        }
    }
    
    saveChatsToStorage();
    renderChatsList();
    updateUI();
}

function clearCurrentChat() {
    if (!currentChatId) return;
    
    if (!confirm('Clear all messages in this chat?')) return;
    
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages = [];
        chat.title = 'New Conversation';
        saveChatsToStorage();
        renderMessages([]);
        renderChatsList();
        updateUI();
    }
}

// ===========================
// UI RENDERING
// ===========================
function updateUI() {
    // Update chat count badge
    document.getElementById('chatCountBadge').textContent = chats.length;
}

function renderChatsList() {
    const chatList = document.getElementById('chatList');
    
    if (chats.length === 0) {
        chatList.innerHTML = `
            <div class="no-chats-message">
                <p>No chats yet</p>
                <small>Start a new conversation</small>
            </div>
        `;
        return;
    }
    
    chatList.innerHTML = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        const preview = chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1].content.slice(0, 60) + '...'
            : 'Start chatting...';
        const time = formatChatTime(chat.timestamp);
        
        return `
            <div class="chat-item ${isActive ? 'active' : ''}" onclick="switchChat(${chat.id})">
                <div class="chat-item-header">
                    <span class="chat-icon"></span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-title">${escapeHtml(chat.title)}</div>
                <div class="chat-preview">${escapeHtml(preview)}</div>
            </div>
        `;
    }).join('');
}

function renderMessages(messages) {
    const emptyState = document.getElementById('emptyState');
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length === 0) {
        emptyState.style.display = 'flex';
        messagesList.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    messagesList.style.display = 'block';
    
    // Clear existing messages except date separator
    const dateSeparator = messagesList.querySelector('.date-separator');
    messagesList.innerHTML = '';
    if (dateSeparator) {
        messagesList.appendChild(dateSeparator);
    } else {
        messagesList.innerHTML = '<div class="date-separator">Today</div>';
    }
    
    // Add messages
    messages.forEach(msg => {
        const messageHTML = createMessageHTML(msg);
        messagesList.insertAdjacentHTML('beforeend', messageHTML);
    });
    
    scrollToBottom();
}

function createMessageHTML(message) {
    const time = formatTime(message.timestamp);
    const isUser = message.role === 'user';
    
    return `
        <div class="message-group">
            <div class="message-header-row">
                <div class="message-avatar ${isUser ? 'user' : ''}">
                    ${isUser ? '<i class="bi bi-person-fill"></i>' : '<span style="font-size: 0.8rem; font-weight: 700;">AI</span>'}
                </div>
                <span class="message-sender">${isUser ? 'You' : 'Response'}</span>
                <span class="message-time-stamp">${message.messageNumber ? `${message.messageNumber} • ` : ''}${time}</span>
            </div>
            <div class="message-content-box ${isUser ? 'user' : ''}">
                <div class="message-text">${escapeHtml(message.content)}</div>
            </div>
            ${!isUser ? `
                <div class="message-actions">
                    <button class="action-btn" onclick="copyMessage(this)">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <button class="action-btn">
                        <i class="bi bi-arrow-repeat"></i> Generate Response
                    </button>
                    <button class="action-btn">
                        <i class="bi bi-bookmark"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// ===========================
// MESSAGE SENDING
// ===========================
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || isLoading) return;
    
    // Clear input immediately
    input.value = '';
    
    // If no current chat, this shouldn't happen but handle it
    if (!currentChatId) {
        createNewChat();
    }
    
    // Create user message
    const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    };
    
    // Add to current chat
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push(userMessage);
        
        // Update chat title if it's the first message
        if (chat.messages.length === 1) {
            chat.title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
        }
        
        renderMessages(chat.messages);
        saveChatsToStorage();
        renderChatsList();
    }
    
    // Show loading
    setLoading(true);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Create AI message
        const aiMessage = {
            role: 'assistant',
            content: data.content[0].text,
            timestamp: new Date().toISOString(),
            messageNumber: chat.messages.length
        };
        
        chat.messages.push(aiMessage);
        renderMessages(chat.messages);
        saveChatsToStorage();
        renderChatsList();
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to get response. Make sure the server is running on localhost:3000');
        
        // Add error message to chat
        const errorMessage = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please make sure the server is running.',
            timestamp: new Date().toISOString(),
            isError: true
        };
        
        chat.messages.push(errorMessage);
        renderMessages(chat.messages);
        saveChatsToStorage();
        
    } finally {
        setLoading(false);
    }
}

// ===========================
// UI HELPERS
// ===========================
function setLoading(loading) {
    isLoading = loading;
    const sendBtn = document.getElementById('sendBtn');
    const input = document.getElementById('messageInput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    sendBtn.disabled = loading;
    input.disabled = loading;
    
    if (loading) {
        loadingIndicator.style.display = 'flex';
    } else {
        loadingIndicator.style.display = 'none';
        input.focus();
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function setInputValue(value) {
    document.getElementById('messageInput').value = value;
    document.getElementById('messageInput').focus();
}

function scrollToBottom() {
    const messagesArea = document.getElementById('messagesArea');
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function copyMessage(button) {
    const messageText = button.closest('.message-group').querySelector('.message-text').textContent;
    navigator.clipboard.writeText(messageText).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    });
}

// ===========================
// EVENT HANDLERS
// ===========================
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
    });
}

function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// CLEAR ALL CHATS FUNCTION
// ===========================
function clearCurrentChat() {
    if (chats.length === 0) {
        alert('No chats to clear');
        return;
    }
    
    // Create custom confirmation dialog
    const confirmMessage = `This will permanently delete ALL ${chats.length} chat${chats.length > 1 ? 's' : ''} and their message history.\n\nAre you sure you want to continue?`;
    
    if (!confirm(confirmMessage)) return;
    
    // Clear all chats
    chats = [];
    currentChatId = null;
    
    // Save to storage
    saveChatsToStorage();
    
    // Update UI
    renderChatsList();
    renderMessages([]);
    updateUI();
    
    // Show empty state
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('messagesList').style.display = 'none';
    
    // Create a new chat automatically
    setTimeout(() => {
        createNewChat();
    }, 300);
}

// ===========================
// MOBILE SIDEBAR FUNCTIONS
// ===========================
function toggleMobileSidebar() {
    const chatSidebar = document.querySelector('.chat-sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    chatSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    
    // Update menu icon
    const menuToggle = document.getElementById('mobileMenuToggle');
    const icon = menuToggle.querySelector('i');
    
    if (chatSidebar.classList.contains('open')) {
        icon.className = 'bi bi-x';
    } else {
        icon.className = 'bi bi-list';
    }
}

function closeSidebars() {
    const leftSidebar = document.querySelector('.left-sidebar');
    const chatSidebar = document.querySelector('.chat-sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('mobileMenuToggle');
    
    leftSidebar.classList.remove('open');
    chatSidebar.classList.remove('open');
    overlay.classList.remove('active');
    
    // Reset menu icon
    if (menuToggle) {
        const icon = menuToggle.querySelector('i');
        icon.className = 'bi bi-list';
    }
}

// Close sidebars when switching chats on mobile
const originalSwitchChat = switchChat;
switchChat = function(chatId) {
    originalSwitchChat(chatId);
    
    // Close mobile sidebar after selecting chat
    if (window.innerWidth <= 599) {
        closeSidebars();
    }
};

// Handle window resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // Close sidebars if resizing to larger screen
        if (window.innerWidth > 599) {
            closeSidebars();
        }
    }, 250);
});