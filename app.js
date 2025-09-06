// --- Business Central OAuth 2.0 API call using node-fetch ---
const fetch = require('node-fetch');

// Replace these with your actual values
const TENANT_ID = 'YOUR_TENANT_ID';
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const SCOPE = 'https://api.businesscentral.dynamics.com/.default';
const BC_API_URL = 'https://api.businesscentral.dynamics.com/v2.0/YOUR_TENANT_ID/sandbox/api/v2.0/companies';

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('scope', SCOPE);
  params.append('grant_type', 'client_credentials');

  const response = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    body: params
  });
  if (!response.ok) {
    throw new Error('Failed to get access token: ' + response.statusText);
  }
  const data = await response.json();
  return data.access_token;
}

async function callBusinessCentralApi() {
  try {
    const token = await getAccessToken();
    const response = await fetch(BC_API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Failed to call Business Central API: ' + response.statusText);
    }
    const data = await response.json();
    // Push or process the data as needed
    console.log('Business Central API data:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Example usage
// callBusinessCentralApi();
// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Respond to webhook immediately
  res.status(200).end();

  // Call Business Central API and log the data asynchronously
  callBusinessCentralApi()
    .catch((err) => {
      console.error('Business Central API error:', err.message);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});