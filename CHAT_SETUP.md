# UniSport-Pro Chat Setup Guide

## 🚀 Quick Start

Your chat system is now independent and doesn't require Base44! Here's how to run it:

### Step 1: Install Dependencies
```bash
npm install
```

This will install Express, CORS, and Concurrently for running both servers.

### Step 2: Run Both Servers (Recommended)
```bash
npm run dev:all
```

This runs:
- **Frontend** (Vite): http://localhost:5173
- **Chat API**: http://localhost:3001

### OR Run Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Chat API:**
```bash
npm run server
```

## 📝 How It Works

1. **Frontend** (Chat.jsx) sends requests to `/api/chat`
2. **Vite Dev Server** proxies `/api` requests to `http://localhost:3001`
3. **Chat Server** (server.js) processes messages and returns responses
4. **Voice Input** uses Web Speech API (built-in browser feature)

## 🎤 Features

✅ **Voice Search** - Click microphone icon to record and transcribe
✅ **Text Chat** - Type or submit voice-to-text messages
✅ **Mock Responses** - Basic keyword matching for demo responses
✅ **Suggestions** - Quick action buttons for common questions

## 🔧 Customizing Responses

Edit `server.js` to add more chat responses:

```javascript
const chatResponses = {
  'your keyword': 'Your response here',
  'another keyword': 'Another response'
};
```

## 📡 Connecting to Real Backend

To connect to your own backend:

1. Update `server.js` to call your API instead of using mock responses
2. Or replace the entire `server.js` with your own backend
3. Make sure CORS is enabled for `http://localhost:5173`

## ✨ Next Steps

- Add database integration to server.js
- Implement real AI responses (OpenAI API, etc.)
- Add user authentication
- Store chat history
- Deploy to production

Enjoy your chat system! 🎉
