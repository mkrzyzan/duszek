#!/usr/bin/env node

import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Load environment variables
dotenv.config();

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = process.env.MODEL || 'llama-3.3-70b-versatile';
const REQUEST_TIMEOUT = Number.parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
const PROXY = process.env.PROXY || '';
let DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1';
const MAX_DEBUG_ERROR_LENGTH = 1000;

function debugLog(label: string, data: unknown): void {
  if (!DEBUG) {
    return;
  }

  console.log(chalk.gray(`\n[DEBUG] ${label}:`));
  if (typeof data === 'object') {
    console.log(chalk.gray(JSON.stringify(data, null, 2)));
  } else {
    console.log(chalk.gray(String(data)));
  }
}

const SYSTEM_PROMPT = `You are DUSZEK, a lightweight CLI AI assistant designed to help with coding and automation tasks.
You provide concise, practical answers. You focus on:
- Writing and debugging code
- Explaining programming concepts
- Suggesting automation solutions
- Helping with command-line tasks
- Providing quick technical guidance

Keep responses clear and to the point. When writing code, use markdown code blocks with language specification.`;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
let conversationHistory: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];

function printBanner(): void {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║                                       ║
║          👻 DUSZEK v1.0 👻            ║
║   Lightweight CLI AI Assistant        ║
║                                       ║
╚═══════════════════════════════════════╝
`));
}

function printInteractiveHints(): void {
  console.log(chalk.gray('Examples:'));
  console.log(chalk.white('  /help'));
  console.log(chalk.white('  /clear'));
  console.log(chalk.white('  Explain async/await in JavaScript'));
  console.log(chalk.white('  Write a bash one-liner to list large files'));
  console.log();
}

function checkConfiguration(): boolean {
  if (GROQ_API_KEY) {
    return true;
  }

  console.log(chalk.yellow('\n⚠️  GROQ_API_KEY is not configured yet.'));
  console.log(chalk.gray('You can still use /help and /exit. Add GROQ_API_KEY to send prompts.\n'));
  return false;
}

async function callGroqAPI(userMessage: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Add it to your environment or .env file.');
  }

  conversationHistory.push({ role: 'user', content: userMessage });

  const payload = JSON.stringify({
    model: MODEL,
    messages: conversationHistory,
    temperature: 0.7,
    max_tokens: 2048,
  });

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const fetchOptions: RequestInit & { proxy?: string } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ['Bearer', GROQ_API_KEY].join(' '),
    },
    body: payload,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    ...(PROXY ? { proxy: PROXY } : {}),
  };

  debugLog('Request Options', {
    url,
    method: fetchOptions.method,
    timeout: REQUEST_TIMEOUT,
    proxy: PROXY || '(none)',
    headers: {
      ...fetchOptions.headers,
      Authorization: '******',
    },
  });
  debugLog('Request Payload', JSON.parse(payload));

  try {
    const res = await fetch(url, fetchOptions);
    const jsonData = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    debugLog('Response Status', res.status);
    debugLog('Response Headers', Object.fromEntries(res.headers));
    debugLog('Response Body', jsonData);

    if (!res.ok) {
      const errorMsg = `API Error (${res.status}): ${jsonData.error?.message || res.statusText}`;
      if (DEBUG) {
        console.log(chalk.gray('\n[DEBUG] Full error response:'));
        console.log(chalk.gray(JSON.stringify(jsonData).substring(0, MAX_DEBUG_ERROR_LENGTH)));
      }
      throw new Error(errorMsg);
    }

    const assistantMessage = jsonData.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      debugLog('Invalid response structure', jsonData);
      throw new Error('Invalid response format from API');
    }

    conversationHistory.push({ role: 'assistant', content: assistantMessage });
    return assistantMessage;
  } catch (error) {
    const err = error as Error & { name?: string };

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error(
        `Request timeout: No response from Groq API after ${REQUEST_TIMEOUT / 1000} seconds.\n` +
          'This may indicate network issues or firewall blocking. Try:\n' +
          '  • Check your firewall settings\n' +
          '  • Verify network connectivity\n' +
          '  • Increase timeout with REQUEST_TIMEOUT env var (in milliseconds)',
      );
    }

    if (err.name === 'SyntaxError') {
      throw new Error(`Failed to parse response: ${err.message}`);
    }

    if (err.message.startsWith('API Error') || err.message.startsWith('Invalid response')) {
      throw err;
    }

    throw new Error(`Failed to get response: ${err.message || 'Unknown error'}`);
  }
}

async function startInteractiveMode(): Promise<void> {
  console.log(chalk.cyan('\n✨ Interactive mode started.'));
  printInteractiveHints();

  const rl = readline.createInterface({ input, output, prompt: '' });
  rl.prompt();

  for await (const line of rl) {
    const trimmedInput = line.trim();

    if (!trimmedInput) {
      rl.prompt();
      continue;
    }

    if (trimmedInput === '/exit' || trimmedInput === '/quit') {
      break;
    }

    if (trimmedInput === '/clear') {
      conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT }];
      console.log(chalk.yellow('\n✓ Conversation history cleared.\n'));
      rl.prompt();
      continue;
    }

    if (trimmedInput === '/help') {
      console.log(chalk.cyan('\n📖 DUSZEK Help:'));
      console.log(chalk.white('  Ask coding/automation questions in plain text.'));
      console.log(chalk.white('\n  Commands:'));
      console.log(chalk.white('    /help   - Show this help message'));
      console.log(chalk.white('    /clear  - Clear conversation history'));
      console.log(chalk.white('    /debug  - Toggle debug mode'));
      console.log(chalk.white('    /exit   - Exit DUSZEK\n'));
      printInteractiveHints();
      rl.prompt();
      continue;
    }

    if (trimmedInput === '/debug') {
      DEBUG = !DEBUG;
      console.log(chalk.yellow(`\n✓ Debug mode ${DEBUG ? 'enabled' : 'disabled'}.\n`));
      rl.prompt();
      continue;
    }

    const spinner = ora('🤔 DUSZEK is thinking...').start();

    try {
      const response = await callGroqAPI(trimmedInput);
      spinner.stop();
      console.log(chalk.blue('\n🤖 DUSZEK: ') + chalk.white(response));
    } catch (error) {
      spinner.stop();
      const err = error as Error;
      console.log(chalk.red('\n❌ Error: ' + err.message));
      if (DEBUG) {
        console.log(chalk.gray('\n[DEBUG] Full error stack:'));
        console.log(chalk.gray(err.stack || 'No stack available'));
      }
    }

    rl.prompt();
  }

  console.log(chalk.cyan('\n👋 Goodbye! DUSZEK signing off.\n'));
}

async function processSingleQuery(query: string): Promise<void> {
  const spinner = ora('🤔 DUSZEK is thinking...').start();

  try {
    const response = await callGroqAPI(query);
    spinner.stop();
    console.log(chalk.blue('\n🤖 DUSZEK: ') + chalk.white(response) + '\n');
  } catch (error) {
    spinner.stop();
    const err = error as Error;
    console.log(chalk.red('\n❌ Error: ' + err.message + '\n'));
    if (DEBUG) {
      console.log(chalk.gray('[DEBUG] Full error stack:'));
      console.log(chalk.gray(err.stack || 'No stack available'));
      console.log();
    }
    process.exit(1);
  }
}

async function main(): Promise<void> {
  printBanner();

  const args = process.argv.slice(2);
  if (args.includes('--debug') || args.includes('-d')) {
    DEBUG = true;
    console.log(chalk.yellow('🐛 Debug mode enabled\n'));
  }

  const configured = checkConfiguration();
  if (configured) {
    console.log(chalk.green('✓ Configuration loaded'));
    console.log(chalk.gray(`Model: ${MODEL}`));
    if (DEBUG) {
      console.log(chalk.gray('Debug: ON'));
    }
    console.log();
  }

  const queryArgs = args.filter((arg) => !arg.startsWith('--') && !arg.startsWith('-'));

  if (queryArgs.length > 0) {
    await processSingleQuery(queryArgs.join(' '));
    return;
  }

  await startInteractiveMode();
}

main().catch((error) => {
  const err = error as Error;
  console.error(chalk.red('\n❌ Fatal error:', err.message));
  if (DEBUG) {
    console.error(chalk.gray('\n[DEBUG] Full error stack:'));
    console.error(chalk.gray(err.stack || 'No stack available'));
  }
  process.exit(1);
});
