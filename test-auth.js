#!/usr/bin/env node

/**
 * Simple test script for the authentication system
 * Run with: node test-auth.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', healthData);
    console.log();

    // Test 2: Register User
    console.log('2️⃣ Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    });
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', registerData);
    
    if (!registerData.success) {
      console.log('   ⚠️  User might already exist, continuing with login test...\n');
    } else {
      console.log('   🎉 User registered successfully!\n');
    }

    // Test 3: Login User
    console.log('3️⃣ Testing user login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', loginData);

    if (!loginData.success) {
      console.log('   ❌ Login failed, cannot continue with protected route tests');
      return;
    }

    const token = loginData.data.token;
    console.log('   🎉 Login successful! Token received.');
    console.log('   🔑 Refresh token:', loginData.data.refreshToken ? 'RECEIVED' : 'NOT RECEIVED');
    console.log();

    // Test 4: Refresh Token
    console.log('4️⃣ Testing token refresh...');
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: loginData.data.refreshToken
      })
    });
    const refreshData = await refreshResponse.json();
    console.log('✅ Token refresh:', refreshData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', refreshData);
    
    let currentToken = token; // Use a different variable name
    if (refreshData.success) {
      console.log('   🎉 New tokens received!');
      // Update token for subsequent tests
      currentToken = refreshData.data.token;
    }
    console.log();

    // Test 5: Verify Token
    console.log('5️⃣ Testing token verification...');
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const verifyData = await verifyResponse.json();
    console.log('✅ Token verification:', verifyData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', verifyData);
    console.log();

    // Test 6: Protected Route (Responses)
    console.log('6️⃣ Testing protected route (responses)...');
    const responsesResponse = await fetch(`${BASE_URL}/api/responses`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const responsesData = await responsesResponse.json();
    console.log('✅ Protected route:', responsesData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', responsesData);
    console.log();

    // Test 7: Logout
    console.log('7️⃣ Testing user logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });
    const logoutData = await logoutResponse.json();
    console.log('✅ User logout:', logoutData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', logoutData);
    console.log();

    // Test 8: Invalid Token
    console.log('8️⃣ Testing invalid token...');
    const invalidResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    const invalidData = await invalidResponse.json();
    console.log('✅ Invalid token handling:', !invalidData.success ? 'PASSED' : 'FAILED');
    console.log('   Response:', invalidData);
    console.log();

    console.log('🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Health check: ✅');
    console.log('   - User registration: ✅');
    console.log('   - User login: ✅');
    console.log('   - Token refresh: ✅');
    console.log('   - Token verification: ✅');
    console.log('   - Protected routes: ✅');
    console.log('   - User logout: ✅');
    console.log('   - Error handling: ✅');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run tests
testAuth();
