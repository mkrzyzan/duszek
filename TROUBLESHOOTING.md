# Troubleshooting Guide

## Node.js Fetch Timeout Issues (ETIMEDOUT)

### Problem

When using Node.js's native `fetch()` to call the Groq API, you may encounter timeout errors:

```
Error: TypeError: fetch failed
  [cause]: AggregateError [ETIMEDOUT]
```

However, the same code works perfectly with **Bun** runtime.

### Why This Happens

Node.js's native `fetch` implementation (via undici) can have issues with:
- Certain firewall configurations
- Corporate proxies
- VPN connections
- DNS resolution in some network environments
- TLS/SSL handshake variations

Bun's fetch implementation uses a different HTTP client that doesn't encounter these issues.

### Solutions

#### Solution 1: Use Node.js `https` Module (Recommended)

Replace `fetch` with the built-in `https` module for better compatibility:

```javascript
import https from 'https';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const payload = JSON.stringify({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: "Explain the importance of fast language models"
    }
  ]
});

const options = {
  hostname: 'api.groq.com',
  port: 443,
  path: '/openai/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `******
    'Content-Length': Buffer.byteLength(payload)
  },
  timeout: 30000  // 30 second timeout
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log("Response from GROQ API:", jsonData);
    } catch (error) {
      console.error("Error parsing response:", error);
    }
  });
});

req.on('error', (error) => {
  console.error("Error:", error);
});

req.on('timeout', () => {
  req.destroy();
  console.error("Request timeout after 30 seconds");
});

req.write(payload);
req.end();
```

#### Solution 2: Use axios or node-fetch Library

Install a dedicated HTTP client library:

```bash
npm install axios
```

```javascript
import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

axios.post('https://api.groq.com/openai/v1/chat/completions', {
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: "Explain the importance of fast language models"
    }
  ]
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `******
  },
  timeout: 30000  // 30 second timeout
})
.then(response => {
  console.log("Response from GROQ API:", response.data);
})
.catch(error => {
  console.error("Error:", error.message);
});
```

#### Solution 3: Continue Using Bun

If you have Bun installed and it works, continue using it:

```bash
bun your-script.js
```

Bun is faster and has better network handling for many use cases.

#### Solution 4: Increase Timeout and Add Retry Logic

If you must use native fetch, add timeout configuration:

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

try {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `******
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: "Explain the importance of fast language models"
        }
      ]
    }),
    signal: controller.signal
  });
  
  clearTimeout(timeoutId);
  const data = await response.json();
  console.log("Response from GROQ API:", data);
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    console.error("Request timeout after 60 seconds");
  } else {
    console.error("Error:", error);
  }
}
```

### Network Diagnostics

If you continue to have issues, test your connection:

```bash
# Test if you can reach the API
curl -I https://api.groq.com

# Test with a simple request
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"hi"}]}'
```

### Firewall Configuration

If the issue persists:

1. **Check Firewall**: Ensure outbound HTTPS (port 443) to `api.groq.com` is allowed
2. **Check Proxy**: If behind a corporate proxy, configure Node.js to use it:
   ```bash
   export HTTP_PROXY=http://your-proxy:port
   export HTTPS_PROXY=http://your-proxy:port
   ```
3. **Check DNS**: Verify DNS resolution:
   ```bash
   nslookup api.groq.com
   ```
4. **Disable VPN**: Temporarily disable VPN to see if it's causing issues

### Why DUSZEK Works

DUSZEK (this CLI tool) already uses the `https` module instead of `fetch`, which is why it works reliably even in environments where native fetch times out.

You can see the implementation in `index.js` for a complete working example.

## Other Common Issues

### "GROQ_API_KEY not configured"

Make sure you have:
1. Created a `.env` file in your project directory
2. Added your API key: `GROQ_API_KEY=your_actual_key_here`
3. The key starts with `gsk_`

### "Invalid API Key" (401 Error)

1. Verify your API key is correct
2. Check it hasn't expired
3. Get a new key from https://console.groq.com if needed

### "Rate Limit Exceeded" (429 Error)

You've exceeded the free tier limits. Wait a few minutes or check your usage at https://console.groq.com

### Import/Export Issues

Make sure your package.json has:
```json
{
  "type": "module"
}
```

Or use CommonJS require:
```javascript
const https = require('https');
```

## Getting Help

If you're still experiencing issues:

1. Enable debug mode in DUSZEK: `node index.js --debug "test"`
2. Check the [README](README.md) for configuration options
3. Review [QUICKSTART](QUICKSTART.md) for setup instructions
4. Share debug output when asking for help (with API key redacted)
