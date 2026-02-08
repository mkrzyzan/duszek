import * as readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green('\n💬 You: ')
});

console.log('Starting test interactive mode...\n');
rl.prompt();

let count = 0;

rl.on('line', (input) => {
  count++;
  console.log(`\n✓ Received input #${count}: "${input}"`);
  
  if (input.trim() === '/exit') {
    console.log('Exiting...');
    rl.close();
    return;
  }
  
  // Simulate async processing
  setTimeout(() => {
    console.log(`Response to #${count}: Processed "${input}"`);
    console.log('About to call rl.prompt()...');
    rl.prompt();
    console.log('rl.prompt() called');
  }, 100);
});

rl.on('close', () => {
  console.log('\nreadline interface closed');
  process.exit(0);
});

console.log('Setup complete, waiting for input...');
