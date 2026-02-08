import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

process.stdin.on('end', () => {
  console.log('\nSTDIN END EVENT!');
});

process.stdin.on('close', () => {
  console.log('\nSTDIN CLOSE EVENT!');
});

rl.on('close', () => {
  console.log('\nREADLINE CLOSE EVENT!');
  process.exit(0);
});

console.log('Listening for events...\n');
rl.prompt();

rl.on('line', (input) => {
  console.log(`Got: ${input}`);
  if (input === 'exit') {
    rl.close();
  } else {
    rl.prompt();
  }
});
