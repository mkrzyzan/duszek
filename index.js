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
let DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1'; // Mutable to allow /debug command toggle
const MAX_DEBUG_ERROR_LENGTH = 1000; // Maximum characters to display for error responses

// Debug logging function
function debugLog(label, data) {
  if (DEBUG) {
    console.log(chalk.gray(`\n[DEBUG] ${label}:`));
    if (typeof data === 'object') {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    } else {
      console.log(chalk.gray(data));
    }
  }
}

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

      debugLog('Request Options', {
        hostname: options.hostname,
        path: options.path,
        method: options.method,
        headers: {
          ...options.headers,
          'Authorization': 'Bearer [REDACTED]'
        }
      });
      debugLog('Request Payload', JSON.parse(payload));

      const req = https.request(options, (res) => {
        let data = '';

        debugLog('Response Status', res.statusCode);
        debugLog('Response Headers', res.headers);

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            debugLog('Raw Response Body', data);

            if (res.statusCode !== 200) {
              let errorData = {};
              try {
                errorData = JSON.parse(data);
              } catch (e) {
                debugLog('Failed to parse error response as JSON', e.message);
              }
              const errorMsg = `API Error (${res.statusCode}): ${errorData.error?.message || res.statusMessage}`;
              if (DEBUG) {
                console.log(chalk.gray('\n[DEBUG] Full error response:'));
                console.log(chalk.gray(data.substring(0, MAX_DEBUG_ERROR_LENGTH)));
              }
              reject(new Error(errorMsg));
              return;
            }

            const jsonData = JSON.parse(data);

            if (!jsonData.choices || !jsonData.choices[0] || !jsonData.choices[0].message) {
              debugLog('Invalid response structure', jsonData);
              reject(new Error('Invalid response format from API'));
              return;
            }

            const assistantMessage = jsonData.choices[0].message.content;
            conversationHistory.push({ role: 'assistant', content: assistantMessage });
            resolve(assistantMessage);
          } catch (error) {
            debugLog('Parse Error Details', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        debugLog('Request Error Details', {
          ...error,
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        // Provide more helpful error messages
        if (error.code === 'ENOTFOUND' || 
            error.code === 'ECONNREFUSED' ||
            error.message.includes('network')) {
          reject(new Error('Network error: Unable to connect to Groq API. Please check your internet connection.'));
        } else {
          reject(new Error(`Failed to get response: ${error.message || error.code || 'Unknown error'}`));
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
      console.log(chalk.white('    /help   - Show this help message'));
      console.log(chalk.white('    /clear  - Clear conversation history'));
      console.log(chalk.white('    /debug  - Toggle debug mode'));
      console.log(chalk.white('    /exit   - Exit DUSZEK\n'));
      rl.prompt();
      return;
    }

    if (trimmedInput === '/debug') {
      DEBUG = !DEBUG;
      console.log(chalk.yellow(`\n✓ Debug mode ${DEBUG ? 'enabled' : 'disabled'}.\n`));
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
      if (DEBUG) {
        console.log(chalk.gray('\n[DEBUG] Full error stack:'));
        console.log(chalk.gray(error.stack));
      }
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
    if (DEBUG) {
      console.log(chalk.gray('[DEBUG] Full error stack:'));
      console.log(chalk.gray(error.stack));
      console.log();
    }
    process.exit(1);
  }
}

// Main function
async function main() {
  printBanner();

  // Check for --debug flag
  const args = process.argv.slice(2);
  if (args.includes('--debug') || args.includes('-d')) {
    DEBUG = true;
    console.log(chalk.yellow('🐛 Debug mode enabled\n'));
  }

  if (!checkConfiguration()) {
    process.exit(1);
  }

  console.log(chalk.green('✓ Configuration loaded'));
  console.log(chalk.gray(`Model: ${MODEL}`));
  if (DEBUG) {
    console.log(chalk.gray('Debug: ON'));
  }
  console.log();

  // Remove flags from args for query processing
  const queryArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));
  
  if (queryArgs.length > 0) {
    // Single query mode
    const query = queryArgs.join(' ');
    await processSingleQuery(query);
  } else {
    // Interactive mode
    await startInteractiveMode();
  }
}

// Run the application
main().catch((error) => {
  console.error(chalk.red('\n❌ Fatal error:', error.message));
  if (DEBUG) {
    console.error(chalk.gray('\n[DEBUG] Full error stack:'));
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});
