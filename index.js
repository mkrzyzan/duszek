#!/usr/bin/env node

import * as readline from 'readline';
import https from 'https';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';

// Load environment variables
dotenv.config();

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = process.env.MODEL || 'llama-3.3-70b-versatile'; // Fast and capable model

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
  return new Promise((resolve, reject) => {
    try {
      conversationHistory.push({ role: 'user', content: userMessage });

      const payload = JSON.stringify({
        model: MODEL,
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 2048
      });

      const options = {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              let errorData = {};
              try {
                errorData = JSON.parse(data);
              } catch (e) {
                // If error response isn't JSON, that's okay
              }
              reject(new Error(`API Error (${res.statusCode}): ${errorData.error?.message || res.statusMessage}`));
              return;
            }

            const jsonData = JSON.parse(data);

            if (!jsonData.choices || !jsonData.choices[0] || !jsonData.choices[0].message) {
              reject(new Error('Invalid response format from API'));
              return;
            }

            const assistantMessage = jsonData.choices[0].message.content;
            conversationHistory.push({ role: 'assistant', content: assistantMessage });
            resolve(assistantMessage);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        // Provide more helpful error messages
        if (error.code === 'ENOTFOUND' || 
            error.code === 'ECONNREFUSED' ||
            error.message.includes('network')) {
          reject(new Error('Network error: Unable to connect to Groq API. Please check your internet connection.'));
        } else {
          reject(new Error(`Failed to get response: ${error.message}`));
        }
      });

      req.write(payload);
      req.end();
    } catch (error) {
      reject(new Error(`Failed to make request: ${error.message}`));
    }
  });
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
