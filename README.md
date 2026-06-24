# DUSZEK

DUSZEK is a lightweight terminal AI assistant with a friendly text UI.

## Install

```bash
npm install -g duszek
```

## Run

```bash
duszek
```

You can also run a single prompt directly:

```bash
duszek "Explain async/await in JavaScript"
```

## Interactive usage

When started without arguments, DUSZEK opens an interactive terminal prompt with an empty input line and built-in examples.

Useful commands:

- `/help` - show available commands and examples
- `/clear` - clear conversation history
- `/debug` - toggle debug mode
- `/exit` - quit

## Configuration

Create a `.env` file (or set env vars):

```bash
GROQ_API_KEY=your_groq_api_key_here
MODEL=llama-3.3-70b-versatile
```

Without `GROQ_API_KEY`, DUSZEK still starts so you can view help and examples.

## Development

```bash
npm install
npm run build
npm start
```
