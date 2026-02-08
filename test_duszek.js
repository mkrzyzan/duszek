import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.MODEL || 'llama-3.1-70b-versatile';

const SYSTEM_PROMPT = `You are DUSZEK, a lightweight CLI AI assistant.`;

let conversationHistory = [
  { role: 'system', content: SYSTEM_PROMPT }
];

const userMessage = "Write a simple hello world function in Python";
conversationHistory.push({ role: 'user', content: userMessage });

console.log('Making request to:', GROQ_API_URL);
console.log('Model:', MODEL);
console.log('API Key:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'NOT SET');

const payload = {
  model: MODEL,
  messages: conversationHistory,
  temperature: 0.7,
  max_tokens: 2048
};

console.log('\nPayload:', JSON.stringify(payload, null, 2));

try {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  console.log('\nResponse status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  const text = await response.text();
  console.log('\nResponse body (first 500 chars):');
  console.log(text.substring(0, 500));
  
  if (response.ok) {
    const data = JSON.parse(text);
    console.log('\n✅ SUCCESS!');
    console.log('Assistant reply:', data.choices[0].message.content);
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
}
