# 👻 DUSZEK - Lightweight CLI AI Assistant

DUSZEK is a simple, fast, and lightweight command-line AI assistant designed to help with coding and automation tasks. It leverages the power of Groq's fast LLM API to provide instant assistance right from your terminal.

## ✨ Features

- 🚀 **Fast & Lightweight** - Minimal dependencies, instant responses
- 💬 **Interactive Mode** - Have natural conversations with the AI
- 🎯 **Single Query Mode** - Get quick answers without entering interactive mode
- 🔧 **Coding Assistant** - Help with code, debugging, and explanations
- 🤖 **Automation Helper** - Assistance with scripting and automation tasks
- 🌐 **Free API** - Uses Groq's free API (no credit card required)
- 🎨 **Beautiful CLI** - Colored output and loading indicators

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- A free Groq API key

## 🚀 Quick Start

### 1. Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account (no credit card needed)
3. Navigate to API Keys section
4. Create a new API key

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_actual_api_key_here
```

### 4. Run DUSZEK

**Interactive Mode:**
```bash
npm start
```
or
```bash
node index.js
```

**Single Query Mode:**
```bash
node index.js "How do I reverse a string in Python?"
```

## 💡 Usage Examples

### Interactive Mode

```bash
$ npm start

╔═══════════════════════════════════════╗
║                                       ║
║          👻 DUSZEK v1.0 👻            ║
║   Lightweight CLI AI Assistant        ║
║                                       ║
╚═══════════════════════════════════════╝

✓ Configuration loaded
Model: llama-3.3-70b-versatile

✨ Interactive mode started. Type your questions or requests.
Commands: /help - show help, /clear - clear history, /exit - quit

💬 You: Write a Python function to calculate factorial
🤖 DUSZEK: Here's a recursive Python function to calculate factorial:

```python
def factorial(n):
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

# Example usage
print(factorial(5))  # Output: 120
```

💬 You: /exit
👋 Goodbye! DUSZEK signing off.
```

### Single Query Mode

```bash
$ node index.js "Explain Git rebase in simple terms"

╔═══════════════════════════════════════╗
║                                       ║
║          👻 DUSZEK v1.0 👻            ║
║   Lightweight CLI AI Assistant        ║
║                                       ║
╚═══════════════════════════════════════╝

✓ Configuration loaded
Model: llama-3.3-70b-versatile

🤖 DUSZEK: Git rebase is like picking up your commits and replaying them on top of another branch...
```

## 📝 Available Commands

When in interactive mode, DUSZEK supports these commands:

- `/help` - Display help information
- `/clear` - Clear conversation history and start fresh
- `/exit` or `/quit` - Exit DUSZEK

## ⚙️ Configuration

You can customize DUSZEK's behavior by editing the `.env` file:

### Available Models

- `llama-3.3-70b-versatile` (default) - Best balance of speed and capability (Feb 2026)
- `llama-3.1-8b-instant` - Ultra-fast, ideal for simple queries
- `meta-llama/llama-4-scout-17b-16e-instruct` - Newer Llama 4 model
- `meta-llama/llama-4-maverick-17b-128e-instruct` - Newer Llama 4 model
- `groq/compound` - Groq's own model
- See more at https://console.groq.com/docs/models

Example `.env`:
```env
GROQ_API_KEY=gsk_your_key_here
MODEL=llama-3.3-70b-versatile
```

## 🎯 Use Cases

DUSZEK is perfect for:

- **Code Generation** - Generate code snippets in any language
- **Debugging Help** - Get help understanding error messages
- **Code Explanations** - Understand complex code patterns
- **Command Line Help** - Learn shell commands and scripts
- **Algorithm Explanations** - Understand data structures and algorithms
- **Best Practices** - Learn coding best practices and patterns
- **Quick References** - Get syntax help for various languages
- **Automation Ideas** - Get suggestions for automating tasks

## 🔧 Development

### Project Structure

```
.
├── index.js          # Main application file
├── package.json      # Dependencies and metadata
├── .env.example      # Environment configuration template
├── .env              # Your configuration (not committed)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

### Making Changes

The entire application is contained in `index.js`. Key sections:

- **Configuration** - API setup and model selection
- **System Prompt** - DUSZEK's personality and capabilities
- **API Integration** - Groq API communication
- **Interactive Mode** - Chat interface
- **Single Query Mode** - One-off queries

## 📊 Why Groq?

Groq provides:

- ⚡ **Extremely fast inference** - Responses in milliseconds
- 🆓 **Free tier** - Generous free usage without credit card
- 🤖 **State-of-the-art models** - Access to latest open-source LLMs
- 🔌 **Simple API** - OpenAI-compatible REST API
- 🌍 **No installation** - Cloud-based service

## 🐛 Troubleshooting

### "GROQ_API_KEY not configured"

Make sure you:
1. Created a `.env` file (not `.env.example`)
2. Added your actual API key from Groq Console
3. The key starts with `gsk_`

### "Failed to get response"

Common causes and solutions:

1. **Network connectivity issues**
   - Ensure you have a stable internet connection
   - Check if you're behind a corporate firewall or proxy
   - Try using a different network if possible
   - Some VPNs may block API access

2. **API key issues**
   - Verify your API key is valid and not expired
   - Make sure the key is correctly copied to `.env`
   - Check that there are no extra spaces or quotes in the `.env` file

3. **Rate limits**
   - You may have exceeded the free tier limits
   - Wait a few minutes and try again
   - Check your usage at https://console.groq.com

4. **Service availability**
   - Groq service may be temporarily down
   - Check status at https://status.groq.com (if available)

### Node version issues

DUSZEK requires Node.js 18 or higher. Check your version:
```bash
node --version
```

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

This is a simple, lightweight tool. Feel free to fork and customize for your needs!

## 🙏 Credits

- **Groq** - For providing fast, free LLM API
- **Open Source LLMs** - Meta's Llama, Mistral AI, and others
- **Node.js Community** - For excellent CLI libraries

---

Made with ❤️ for developers who love the command line
