# Quick Start Guide

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gold-nft-prootofconcept
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your Groq API key**
   - Visit https://console.groq.com
   - Sign up (free, no credit card needed)
   - Generate an API key

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your key:
   ```
   GROQ_API_KEY=your_actual_key_here
   ```

5. **Run DUSZEK**
   ```bash
   npm start
   ```

## Usage Examples

### Interactive Chat
```bash
$ npm start
💬 You: How do I read a file in Node.js?
🤖 DUSZEK: [provides answer with code examples]
```

### Quick Query
```bash
$ node index.js "Explain async/await in JavaScript"
```

### Available Commands
- `/help` - Show help
- `/clear` - Clear conversation history
- `/exit` - Quit DUSZEK

## Troubleshooting

If you see "GROQ_API_KEY not configured":
1. Make sure you created `.env` (not `.env.example`)
2. Add your actual API key from Groq Console
3. Restart DUSZEK

## What Makes DUSZEK Lightweight?

- **Minimal dependencies**: Only 4 runtime dependencies
- **Small codebase**: Single file (~200 lines)
- **Fast API**: Groq provides millisecond responses
- **No database**: Stateless, conversation in memory only
- **No UI framework**: Pure CLI, no electron or web server
