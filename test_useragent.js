import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.MODEL || 'llama-3.3-70b-versatile';

const payload = {
  model: MODEL,
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Say hello' }
  ],
  temperature: 0.7,
  max_tokens: 50
};

console.log('Testing with User-Agent header...');

try {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'User-Agent': 'DUSZEK/1.0'
    },
    body: JSON.stringify(payload)
  });

  console.log('Response status:', response.status);
  
  const text = await response.text();
  
  if (response.ok) {
    const data = JSON.parse(text);
    console.log('\n✅ SUCCESS!');
    console.log('Assistant reply:', data.choices[0].message.content);
  } else {
    console.log('\n❌ ERROR');
    console.log('Response:', text.substring(0, 200));
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
}
