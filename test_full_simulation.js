import * as readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import https from 'https';

// Simulate callGroqAPI
async function mockAPICall(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Mock response to: ${message}`);
    }, 1000);
  });
}

// Main interactive loop
async function startInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('\n💬 You: ')
  });

  console.log(chalk.cyan('\n✨ Interactive mode started.\n'));
  
  rl.prompt();

  rl.on('line', async (input) => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      rl.prompt();
      return;
    }

    if (trimmedInput === '/exit') {
      console.log(chalk.cyan('\n👋 Goodbye!\n'));
      rl.close();
      process.exit(0);
    }

    // Process user query
    const spinner = ora('🤔 Thinking...').start();

    try {
      const response = await mockAPICall(trimmedInput);
      spinner.stop();
      console.log(chalk.blue('\n🤖 Response: ') + chalk.white(response));
    } catch (error) {
      spinner.stop();
      console.log(chalk.red('\n❌ Error: ' + error.message));
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.cyan('\n👋 Goodbye from close handler!\n'));
    process.exit(0);
  });
}

startInteractiveMode();
