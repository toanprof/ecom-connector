require('dotenv').config();
const { createEcomConnector } = require('./dist');
const http = require('http');
const url = require('url');

/**
 * Shopee Authentication Demo
 * 
 * This demo shows how to:
 * 1. Generate authorization URL
 * 2. Get access token from authorization code
 * 3. Refresh access token
 * 
 * Flow:
 * 1. Run this script
 * 2. Visit the authorization URL in browser
 * 3. Authorize the app
 * 4. Get redirected back with authorization code
 * 5. Exchange code for access token
 */

const PORT = process.env.AUTH_PORT || 3000;
const REDIRECT_URL = process.env.SHOPEE_REDIRECT_URL || `http://localhost:${PORT}/callback`;

async function shopeeAuthDemo() {
  console.log('\n========================================');
  console.log('  Shopee Authentication Demo');
  console.log('========================================\n');

  // Check credentials
  if (!process.env.SHOPEE_PARTNER_ID || !process.env.SHOPEE_PARTNER_KEY) {
    console.error('❌ Missing Shopee credentials in .env!');
    console.log('\nPlease set in .env:');
    console.log('  SHOPEE_PARTNER_ID=...');
    console.log('  SHOPEE_PARTNER_KEY=...');
    console.log('  SHOPEE_SHOP_ID=... (optional, will be obtained after auth)\n');
    process.exit(1);
  }

  console.log('✓ Found Shopee credentials');
  console.log('  Partner ID:', process.env.SHOPEE_PARTNER_ID);
  
  // Show redirect URL being used
  console.log();
  console.log('⚙️  Configuration:');
  console.log('  Redirect URL:', REDIRECT_URL);
  console.log();
  console.log('⚠️  IMPORTANT: Make sure this redirect URL matches what you');
  console.log('   configured in Shopee Partner Console!');
  console.log('   Go to: https://open.shopee.com/account/api');
  console.log('   Check: Redirect URL Domain setting');
  console.log();

  try {
    // Create connector without access token
    console.log('🔌 Creating Shopee connector (without access token)...\n');
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: process.env.SHOPEE_SHOP_ID || '0', // Temporary, will get real one
      },
      sandbox: true,
    });

    console.log('✅ Connector created\n');
    console.log('═'.repeat(60));

    // Step 1: Generate authorization URL
    console.log('\n📝 STEP 1: Generate Authorization URL');
    console.log('─'.repeat(60));
    
    const authUrl = connector.generateAuthUrl(REDIRECT_URL);
    console.log('\n✓ Authorization URL generated:\n');
    console.log(authUrl);
    console.log();

    // Step 2: Start local server to receive callback
    console.log('═'.repeat(60));
    console.log('\n🌐 STEP 2: Starting local callback server...');
    console.log('─'.repeat(60));

    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      
      if (parsedUrl.pathname === '/callback') {
        console.log('\n✓ Received callback request');
        console.log('  Full URL:', req.url);
        console.log('  Query params:', JSON.stringify(parsedUrl.query, null, 2));
        
        // Check for error in callback (user denied authorization)
        if (parsedUrl.query.error) {
          console.error('\n❌ Authorization denied by user!');
          console.error('  Error:', parsedUrl.query.error);
          console.error('  Error description:', parsedUrl.query.error_description || 'N/A');
          
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Authorization Denied</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 50px auto;
                  padding: 20px;
                  background-color: #f5f5f5;
                }
                .container {
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #dc3545; }
                .error { color: #dc3545; font-size: 48px; }
                .info { 
                  background: #fff3cd;
                  padding: 15px;
                  border-radius: 4px;
                  margin: 20px 0;
                  border-left: 4px solid #ffc107;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="error">⛔</div>
                <h1>Authorization Denied</h1>
                <p>You have cancelled or denied the authorization request.</p>
                
                <div class="info">
                  <h3>What to do next:</h3>
                  <ol>
                    <li>Close this window</li>
                    <li>Stop the server (Ctrl+C in terminal)</li>
                    <li>If you want to authorize, run <code>node shopee-auth-demo.js</code> again</li>
                    <li>Click "Authorize" on the Shopee authorization page</li>
                  </ol>
                </div>
              </div>
            </body>
            </html>
          `);
          
          setTimeout(() => {
            server.close();
            process.exit(1);
          }, 2000);
          return;
        }
        
        const code = parsedUrl.query.code;
        const shopId = parsedUrl.query.shop_id;

        if (!code || !shopId) {
          console.error('\n❌ Missing required parameters!');
          console.error('  Code:', code || '(missing)');
          console.error('  Shop ID:', shopId || '(missing)');
          console.error('  All params:', parsedUrl.query);
          
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Error - Missing Parameters</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 50px auto;
                  padding: 20px;
                  background-color: #f5f5f5;
                }
                .container {
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #dc3545; }
                .error { color: #dc3545; font-size: 48px; }
                .info { 
                  background: #fff3cd;
                  padding: 15px;
                  border-radius: 4px;
                  margin: 20px 0;
                  border-left: 4px solid #ffc107;
                }
                code {
                  background: #f8f9fa;
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-family: monospace;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="error">❌</div>
                <h1>Authorization Failed</h1>
                <p><strong>Missing required parameters:</strong></p>
                <ul>
                  <li>Code: <code>${code || 'MISSING'}</code></li>
                  <li>Shop ID: <code>${shopId || 'MISSING'}</code></li>
                </ul>
                
                <div class="info">
                  <h3>Possible Causes:</h3>
                  <ol>
                    <li>You may have cancelled the authorization</li>
                    <li>The authorization URL may be incorrect</li>
                    <li>There may be a parameter mismatch</li>
                  </ol>
                  
                  <h3>What to do:</h3>
                  <ol>
                    <li>Close this window</li>
                    <li>Stop the server (Ctrl+C in terminal)</li>
                    <li>Run <code>node shopee-auth-demo.js</code> again</li>
                    <li>Make sure to click "Authorize" on the Shopee page</li>
                  </ol>
                </div>
                
                <p>Check the terminal for more details.</p>
              </div>
            </body>
            </html>
          `);
          return;
        }

        console.log('\n✓ Received authorization callback');
        console.log('  Code:', code.substring(0, 20) + '...');
        console.log('  Shop ID:', shopId);
        console.log();

        try {
          // Step 3: Exchange code for access token
          console.log('═'.repeat(60));
          console.log('\n🔑 STEP 3: Exchanging code for access token...');
          console.log('─'.repeat(60));

          const tokenData = await connector.getAccessToken(code, shopId);
          
          console.log('\n✅ Access token obtained successfully!\n');
          console.log('Token Information:');
          console.log('  Access Token:', tokenData.access_token);
          console.log('  Refresh Token:', tokenData.refresh_token);
          console.log('  Expires In:', tokenData.expire_in, 'seconds');
          console.log('  Shop ID:', tokenData.shop_id);
          console.log('  Partner ID:', tokenData.partner_id);
          console.log();

          // Calculate expiration date
          const expiresAt = new Date(Date.now() + tokenData.expire_in * 1000);
          console.log('  Expires At:', expiresAt.toISOString());
          console.log();

          // Save to .env format
          console.log('═'.repeat(60));
          console.log('\n💾 Save these to your .env file:');
          console.log('─'.repeat(60));
          console.log();
          console.log(`SHOPEE_PARTNER_ID=${tokenData.partner_id}`);
          console.log(`SHOPEE_SHOP_ID=${tokenData.shop_id}`);
          console.log(`SHOPEE_ACCESS_TOKEN=${tokenData.access_token}`);
          console.log(`SHOPEE_REFRESH_TOKEN=${tokenData.refresh_token}`);
          console.log();

          // Step 4: Demo refresh token (optional)
          console.log('═'.repeat(60));
          console.log('\n🔄 STEP 4: Testing Refresh Token...');
          console.log('─'.repeat(60));

          try {
            const refreshedData = await connector.refreshAccessToken(
              tokenData.refresh_token,
              shopId
            );
            
            console.log('\n✅ Token refreshed successfully!\n');
            console.log('New Token Information:');
            console.log('  New Access Token:', refreshedData.access_token);
            console.log('  New Refresh Token:', refreshedData.refresh_token);
            console.log('  Expires In:', refreshedData.expire_in, 'seconds');
            console.log();

            const newExpiresAt = new Date(Date.now() + refreshedData.expire_in * 1000);
            console.log('  New Expires At:', newExpiresAt.toISOString());
            console.log();

            console.log('💾 Updated tokens for .env:');
            console.log();
            console.log(`SHOPEE_ACCESS_TOKEN=${refreshedData.access_token}`);
            console.log(`SHOPEE_REFRESH_TOKEN=${refreshedData.refresh_token}`);
            console.log();
          } catch (refreshError) {
            console.error('❌ Failed to refresh token:', refreshError.message);
          }

          // Send success response to browser
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Shopee Authorization Success</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 50px auto;
                  padding: 20px;
                  background-color: #f5f5f5;
                }
                .container {
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #ee4d2d; }
                .success { color: #28a745; font-size: 48px; }
                .info { 
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 4px;
                  margin: 20px 0;
                  font-family: monospace;
                }
                .token {
                  word-break: break-all;
                  background: #e9ecef;
                  padding: 10px;
                  border-radius: 4px;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success">✅</div>
                <h1>Authorization Successful!</h1>
                <p>Your Shopee shop has been authorized successfully.</p>
                
                <div class="info">
                  <h3>Token Information:</h3>
                  <p><strong>Shop ID:</strong> ${tokenData.shop_id}</p>
                  <p><strong>Partner ID:</strong> ${tokenData.partner_id}</p>
                  <p><strong>Expires In:</strong> ${tokenData.expire_in} seconds</p>
                  
                  <h4>Access Token:</h4>
                  <div class="token">${tokenData.access_token}</div>
                  
                  <h4>Refresh Token:</h4>
                  <div class="token">${tokenData.refresh_token}</div>
                </div>
                
                <p><strong>✅ Check your terminal for complete information and .env configuration.</strong></p>
                <p>You can close this window now.</p>
              </div>
            </body>
            </html>
          `);

          // Close server after successful authentication
          console.log('═'.repeat(60));
          console.log('\n✅ Authentication flow completed successfully!');
          console.log('═'.repeat(60));
          console.log();
          
          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 2000);

        } catch (error) {
          console.error('\n❌ Error getting access token:', error.message);
          if (error.platformError) {
            console.error('Platform error:', JSON.stringify(error.platformError, null, 2));
          }

          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`
            <h1>Error</h1>
            <p>Failed to get access token: ${error.message}</p>
            <p>Check the terminal for more details.</p>
          `);
          
          setTimeout(() => {
            server.close();
            process.exit(1);
          }, 2000);
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      }
    });

    server.listen(PORT, () => {
      console.log(`\n✓ Callback server started on http://localhost:${PORT}`);
      console.log();
      console.log('═'.repeat(60));
      console.log('\n📋 IMPORTANT: Follow These Steps:');
      console.log('─'.repeat(60));
      console.log();
      console.log('1. ⚠️  COPY the authorization URL above (scroll up if needed)');
      console.log();
      console.log('2. 🌐 PASTE and OPEN it in your web browser');
      console.log();
      console.log('3. 🔐 LOGIN to your Shopee seller account');
      console.log();
      console.log('4. ✅ CLICK "Authorize" button on Shopee page');
      console.log('   (NOT "Cancel" - that will cause the error)');
      console.log();
      console.log('5. ⏳ You will be redirected back to localhost automatically');
      console.log();
      console.log('6. 🎉 Access token will be displayed in this terminal');
      console.log();
      console.log('═'.repeat(60));
      console.log('\n⏳ Waiting for your authorization...');
      console.log('\n💡 Tip: If you get "Missing code or shop_id" error,');
      console.log('   it means you clicked Cancel instead of Authorize.');
      console.log('\n⚠️  Press Ctrl+C to cancel and start over');
      console.log();
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('\n❌ Server error:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`\n⚠️  Port ${PORT} is already in use!`);
        console.error('\nOptions to fix this:');
        console.error('  1. Close the other application using port ' + PORT);
        console.error('  2. OR use a different port:');
        console.error(`     AUTH_PORT=3001 node shopee-auth-demo.js`);
        console.error('     AUTH_PORT=3002 node shopee-auth-demo.js');
        console.error('     etc.\n');
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message || error);
    if (error.code) console.error('Error code:', error.code);
    if (error.statusCode) console.error('Status code:', error.statusCode);
    if (error.platformError) {
      console.error('\nPlatform error details:');
      console.error(JSON.stringify(error.platformError, null, 2));
      
      // Special handling for redirect URL error
      if (error.platformError.error === 'error_param' && 
          error.platformError.message?.includes('redirect')) {
        console.error('\n🔧 HOW TO FIX REDIRECT URL ERROR:');
        console.error('═'.repeat(60));
        console.error('\n1. Go to Shopee Partner Console:');
        console.error('   https://open.shopee.com/account/api');
        console.error('\n2. Find "Redirect URL Domain" setting');
        console.error('\n3. Add your redirect URL domain:');
        console.error('   - For localhost: http://localhost:' + PORT);
        console.error('   - Or your custom domain');
        console.error('\n4. Current redirect URL being used:');
        console.error('   ' + REDIRECT_URL);
        console.error('\n5. Options:');
        console.error('   A. Add "localhost" to allowed domains in console');
        console.error('   B. OR use custom domain:');
        console.error('      SHOPEE_REDIRECT_URL=https://yourdomain.com/callback \\');
        console.error('      node shopee-auth-demo.js');
        console.error('\n6. Save changes in console and try again\n');
      }
    }
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Authentication cancelled by user');
  process.exit(0);
});

shopeeAuthDemo().catch(err => {
  console.error('\n❌ Unhandled error:', err);
  console.error(err.stack);
  process.exit(1);
});
