const fetch = require('node-fetch');

// Environment variables - load from .env.local or set before running
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://api.giftify.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getToken() {
    console.log('Fetching access token from Auth0...');
    const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            audience: AUTH0_AUDIENCE,
            grant_type: 'client_credentials'
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get token: ${JSON.stringify(data)}`);
    }
    console.log('Access token obtained successfully.');
    return data.access_token;
}

async function checkApi(path) {
    try {
        const token = await getToken();
        console.log(`Checking API endpoint: ${path}`);
        
        const response = await fetch(`${API_URL}${path}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const status = response.status;
        console.log(`API Status: ${status}`);
        
        // Try parsing body
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log('Response Body:', JSON.stringify(json, null, 2));
        } catch {
            console.log('Response Body (Text):', text);
        }

        if (status === 200) {
            console.log('SUCCESS: API endpoint is working correctly.');
        } else {
            console.log('FAILURE: API returned an error status.');
        }

    } catch (error) {
        console.error('ERROR:', error);
    }
}

// Run checklist
// 1. Check Carts API (the one failing 500)
checkApi('/api/v2/carts');
