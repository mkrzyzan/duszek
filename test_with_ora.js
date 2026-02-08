import * as readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green('\n💬 You: ')
});

console.log('Starting test with ora spinner...\n');
rl.prompt();

rl.on('line', async (input) => {
  if (input.trim() === '/exit') {
    rl.close();
    return;
  }
  
  const spinner = ora('Processing...').start();
  
  // Simulate async API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  spinner.stop();
  console.log(`\nResponse: Processed "${input}"`);
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('\nExiting...');
  process.exit(0);
});
