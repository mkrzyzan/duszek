// Example: Calling Groq API with Node.js
// This file demonstrates different approaches to call the Groq API

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('Error: GROQ_API_KEY not set in environment');
  console.error('Create a .env file with: GROQ_API_KEY=your_key_here');
  process.exit(1);
}

// ============================================================================
// APPROACH 1: Using https module (RECOMMENDED - Works reliably)
// ============================================================================
function callGroqWithHttps() {
  console.log('\n=== Using https module (Recommended) ===\n');

  const payload = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: "Explain the importance of fast language models in 2 sentences"
      }
    ],
    temperature: 0.7,
    max_tokens: 100
  });

  const options = {
    hostname: 'api.groq.com',
    port: 443,
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `******`,
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 30000  // 30 second timeout
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✓ Success!');
            console.log('Response:', jsonData.choices[0].message.content);
            resolve(jsonData);
          } else {
            console.error('✗ API Error:', res.statusCode);
            console.error('Message:', jsonData.error?.message || 'Unknown error');
            reject(new Error(`API Error: ${res.statusCode}`));
          }
        } catch (error) {
          console.error('✗ Parse Error:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('✗ Request Error:', error.message);
      console.error('Code:', error.code);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('✗ Timeout: Request took longer than 30 seconds');
      reject(new Error('Request timeout'));
    });

    req.write(payload);
    req.end();
  });
}

// ============================================================================
// APPROACH 2: Using native fetch (MAY TIMEOUT in some environments)
// ============================================================================
async function callGroqWithFetch() {
  console.log('\n=== Using native fetch (May have timeout issues) ===\n');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `******`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "Explain the importance of fast language models in 2 sentences"
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('✗ API Error:', response.status);
      console.error('Message:', errorData.error?.message || 'Unknown error');
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✓ Success!');
    console.log('Response:', data.choices[0].message.content);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('✗ Timeout: Request aborted after 30 seconds');
    } else if (error.cause?.code === 'ETIMEDOUT') {
      console.error('✗ Connection Timeout (ETIMEDOUT)');
      console.error('This often happens due to firewall or network issues.');
      console.error('Suggestion: Use the https module approach instead.');
    } else {
      console.error('✗ Error:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// Main execution
// ============================================================================
async function main() {
  console.log('Groq API Call Examples');
  console.log('======================');

  // Try https module first (recommended)
  try {
    await callGroqWithHttps();
  } catch (error) {
    console.error('\nhttps module failed:', error.message);
  }

  // Try fetch (may fail with ETIMEDOUT)
  try {
    await callGroqWithFetch();
  } catch (error) {
    console.error('\nfetch failed:', error.message);
    console.error('\nNote: If fetch fails with ETIMEDOUT but https works,');
    console.error('this is a known issue. Use the https module approach.');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  });
}

export { callGroqWithHttps, callGroqWithFetch };
