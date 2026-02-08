#!/usr/bin/env node

import * as readline from 'readline';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';

// Load environment variables
dotenv.config();

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.MODEL || 'llama-3.1-70b-versatile'; // Fast and capable model

// System prompt for DUSZEK
const SYSTEM_PROMPT = `You are DUSZEK, a lightweight CLI AI assistant designed to help with coding and automation tasks.
You provide concise, practical answers. You focus on:
- Writing and debugging code
- Explaining programming concepts
- Suggesting automation solutions
- Helping with command-line tasks
- Providing quick technical guidance

Keep responses clear and to the point. When writing code, use markdown code blocks with language specification.`;

// Conversation history
let conversationHistory = [
  { role: 'system', content: SYSTEM_PROMPT }
];

// ASCII art banner
function printBanner() {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║                                       ║
║          👻 DUSZEK v1.0 👻            ║
║   Lightweight CLI AI Assistant        ║
║                                       ║
╚═══════════════════════════════════════╝
`));
}

// Check if API key is configured
function checkConfiguration() {
  if (!GROQ_API_KEY) {
    console.log(chalk.red('\n⚠️  Error: GROQ_API_KEY not configured!'));
    console.log(chalk.yellow('\nTo use DUSZEK, you need to:'));
    console.log(chalk.white('1. Get a free API key from https://console.groq.com'));
    console.log(chalk.white('2. Create a .env file in the project directory'));
    console.log(chalk.white('3. Add your key: GROQ_API_KEY=your_key_here'));
    console.log(chalk.white('\nOptionally, you can also set MODEL (default: llama-3.1-70b-versatile)\n'));
    return false;
  }
  return true;
}

// Call Groq API
async function callGroqAPI(userMessage) {
  try {
    conversationHistory.push({ role: 'user', content: userMessage });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from API');
    }
    
    const assistantMessage = data.choices[0].message.content;
    
    conversationHistory.push({ role: 'assistant', content: assistantMessage });
    
    return assistantMessage;
  } catch (error) {
    // Provide more helpful error messages
    if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
      throw new Error('Network error: Unable to connect to Groq API. Please check your internet connection.');
    }
    if (error.message.includes('Invalid response format')) {
      throw new Error('Invalid response from API. The model may not be available or the response format changed.');
    }
    throw new Error(`Failed to get response: ${error.message}`);
  }
}

// Main interactive loop
async function startInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('\n💬 You: ')
  });

  console.log(chalk.cyan('\n✨ Interactive mode started. Type your questions or requests.'));
  console.log(chalk.gray('Commands: /help - show help, /clear - clear history, /exit - quit\n'));

  rl.prompt();

  rl.on('line', async (input) => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      rl.prompt();
      return;
    }

    // Handle special commands
    if (trimmedInput === '/exit' || trimmedInput === '/quit') {
      console.log(chalk.cyan('\n👋 Goodbye! DUSZEK signing off.\n'));
      rl.close();
      process.exit(0);
    }

    if (trimmedInput === '/clear') {
      conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT }];
      console.log(chalk.yellow('\n✓ Conversation history cleared.\n'));
      rl.prompt();
      return;
    }

    if (trimmedInput === '/help') {
      console.log(chalk.cyan('\n📖 DUSZEK Help:'));
      console.log(chalk.white('  - Ask any coding or automation question'));
      console.log(chalk.white('  - Request code examples or explanations'));
      console.log(chalk.white('  - Get help with command-line tasks'));
      console.log(chalk.white('\n  Commands:'));
      console.log(chalk.white('    /help  - Show this help message'));
      console.log(chalk.white('    /clear - Clear conversation history'));
      console.log(chalk.white('    /exit  - Exit DUSZEK\n'));
      rl.prompt();
      return;
    }

    // Process user query
    const spinner = ora('🤔 DUSZEK is thinking...').start();

    try {
      const response = await callGroqAPI(trimmedInput);
      spinner.stop();
      console.log(chalk.blue('\n🤖 DUSZEK: ') + chalk.white(response));
    } catch (error) {
      spinner.stop();
      console.log(chalk.red('\n❌ Error: ' + error.message));
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.cyan('\n👋 Goodbye! DUSZEK signing off.\n'));
    process.exit(0);
  });
}

// Single query mode
async function processSingleQuery(query) {
  const spinner = ora('🤔 DUSZEK is thinking...').start();

  try {
    const response = await callGroqAPI(query);
    spinner.stop();
    console.log(chalk.blue('\n🤖 DUSZEK: ') + chalk.white(response) + '\n');
  } catch (error) {
    spinner.stop();
    console.log(chalk.red('\n❌ Error: ' + error.message + '\n'));
    process.exit(1);
  }
}

// Main function
async function main() {
  printBanner();

  if (!checkConfiguration()) {
    process.exit(1);
  }

  console.log(chalk.green('✓ Configuration loaded'));
  console.log(chalk.gray(`Model: ${MODEL}\n`));

  // Check if query was passed as command-line argument
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Single query mode
    const query = args.join(' ');
    await processSingleQuery(query);
  } else {
    // Interactive mode
    await startInteractiveMode();
  }
}

// Run the application
main().catch((error) => {
  console.error(chalk.red('\n❌ Fatal error:', error.message));
  process.exit(1);
});
