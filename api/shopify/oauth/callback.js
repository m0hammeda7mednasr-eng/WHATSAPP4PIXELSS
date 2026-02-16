// Shopify OAuth Callback Handler
import { createClient } from '@supabase/supabase-js';
export const config = { runtime: "nodejs" };

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { code, state, shop, hmac } = req.query;

    console.log('📥 OAuth callback received:', { shop, state, hasCode: !!code });

    if (!code || !state || !shop) {
      throw new Error('Missing required OAuth parameters');
    }

    // Decode state data (base64 encoded from frontend)
    let stateData;
    try {
      const decodedState = Buffer.from(state, 'base64').toString('utf-8');
      stateData = JSON.parse(decodedState);
    } catch (err) {
      console.error('❌ Failed to decode state:', err);
      throw new Error('Invalid OAuth state');
    }

    const { brandId, clientId, clientSecret } = stateData;

    if (!brandId || !clientId || !clientSecret) {
      throw new Error('Invalid OAuth state data');
    }

    console.log('🔐 Exchanging code for access token...');

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('❌ Token exchange failed:', error);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, scope } = tokenData;

    console.log('✅ Access token received');

    // Test the token
    const testResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      throw new Error('Token validation failed');
    }

    const shopData = await testResponse.json();
    console.log('✅ Token validated, shop:', shopData.shop.name);

    // Save connection to database
    const { data, error } = await supabase
      .from('shopify_connections')
      .upsert({
        brand_id: brandId,
        shop_url: shop,
        access_token: access_token,
        scope: scope,
        is_active: true
      }, {
        onConflict: 'brand_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    // Update brand
    await supabase
      .from('brands')
      .update({
        shopify_store_url: shop,
        shopify_connected: true
      })
      .eq('id', brandId);

    console.log('✅ Connection saved to database');

    // Redirect back to app with success
    const appUrl = process.env.VITE_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://wahtsapp2.vercel.app';
    const redirectUrl = `${appUrl}?shopify_connected=true`;
    
    res.writeHead(302, { Location: redirectUrl });
    res.end();

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    // Redirect back to app with error
    const appUrl = process.env.VITE_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://wahtsapp2.vercel.app';
    const redirectUrl = `${appUrl}?shopify_error=${encodeURIComponent(error.message)}`;
    
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  }
}
