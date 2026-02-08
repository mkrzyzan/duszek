import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = process.env.MODEL || 'llama-3.3-70b-versatile';

const payload = JSON.stringify({
  model: MODEL,
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Say hello in 5 words' }
  ],
  temperature: 0.7,
  max_tokens: 50
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

console.log('Testing with https module...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const jsonData = JSON.parse(data);
      console.log('\n✅ SUCCESS!');
      console.log('Assistant reply:', jsonData.choices[0].message.content);
    } else {
      console.log('\n❌ ERROR');
      console.log('Response:', data.substring(0, 300));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(payload);
req.end();
