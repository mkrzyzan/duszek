import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.MODEL || 'llama-3.1-70b-versatile';

console.log('Testing Groq API...');
console.log('API Key:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'NOT SET');

const payload = {
  model: MODEL,
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Say hello' }
  ],
  temperature: 0.7,
  max_tokens: 100
};

try {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Response status:', response.status);
  const text = await response.text();
  console.log('\nResponse body:');
  console.log(text.substring(0, 500));
  
  if (response.ok) {
    console.log('\n✅ SUCCESS!');
  } else {
    console.log('\n❌ ERROR - Response is not JSON from API');
  }
} catch (error) {
  console.error('\n❌ Exception:', error.message);
}
