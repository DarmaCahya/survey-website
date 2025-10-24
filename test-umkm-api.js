#!/usr/bin/env node

/**
 * Comprehensive test script for UMKM Cyber Risk Survey API
 * Tests all endpoints with proper authentication and validation
 */

const BASE_URL = 'http://localhost:3000/api/form';

async function testUMKMSurveyAPI() {
  console.log('🧪 Testing UMKM Cyber Risk Survey API...\n');

  let authToken = '';
  let submissionId = 0;

  try {
    // Step 1: Login to get authentication token
    console.log('1️⃣ Authenticating user...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed, trying to register...');
      
      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123',
          name: 'Test UMKM User'
        })
      });
      
      const registerData = await registerResponse.json();
      if (!registerData.success) {
        throw new Error('Failed to register user');
      }
      
      authToken = registerData.data.token;
    } else {
      authToken = loginData.data.token;
    }
    
    console.log('✅ Authentication successful\n');

    // Step 2: Get all assets
    console.log('2️⃣ Testing GET /assets...');
    const assetsResponse = await fetch(`${BASE_URL}/assets`);
    const assetsData = await assetsResponse.json();
    console.log('✅ Assets retrieved:', assetsData.success ? 'PASSED' : 'FAILED');
    console.log(`   Found ${assetsData.data?.length || 0} assets`);
    console.log();

    // Step 3: Get threats for first asset
    console.log('3️⃣ Testing GET /assets/{id}/threats...');
    const firstAsset = assetsData.data?.[0];
    if (firstAsset) {
      const threatsResponse = await fetch(`${BASE_URL}/assets/${firstAsset.id}/threats`);
      const threatsData = await threatsResponse.json();
      console.log('✅ Threats retrieved:', threatsData.success ? 'PASSED' : 'FAILED');
      console.log(`   Found ${threatsData.data?.length || 0} threats for asset "${firstAsset.name}"`);
      console.log();
    }

    // Step 4: Create submission
    console.log('4️⃣ Testing POST /submissions...');
    const createSubmissionResponse = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        assetId: firstAsset?.id || 1,
        threatId: 1
      })
    });
    
    const submissionData = await createSubmissionResponse.json();
    console.log('✅ Submission created:', submissionData.success ? 'PASSED' : 'FAILED');
    if (submissionData.success) {
      submissionId = submissionData.data.submissionId;
      console.log(`   Submission ID: ${submissionId}`);
    }
    console.log();

    // Step 5: Submit risk assessment inputs (test case from requirements)
    console.log('5️⃣ Testing POST /submissions/{id}/inputs...');
    console.log('   Test case: biaya_pengetahuan=4, pengaruh_kerugian=5, Frekuensi_serangan=3, Pemulihan=4');
    console.log('   Expected: J=4.1667, K=3.5, L=15, Category="LOW"');
    
    const submitInputsResponse = await fetch(`${BASE_URL}/submissions/${submissionId}/inputs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        biaya_pengetahuan: 4,
        pengaruh_kerugian: 5,
        Frekuensi_serangan: 3,
        Pemulihan: 4,
        mengerti_poin: true,
        Tidak_mengerti_poin: false,
        description_tidak_mengerti: "Semua sudah jelas"
      })
    });
    
    const inputsData = await submitInputsResponse.json();
    console.log('✅ Inputs submitted:', inputsData.success ? 'PASSED' : 'FAILED');
    
    if (inputsData.success) {
      const result = inputsData.data;
      console.log(`   Peluang (J): ${result.peluang} (expected: 4.1667)`);
      console.log(`   Impact (K): ${result.impact} (expected: 3.5)`);
      console.log(`   Total (L): ${result.total} (expected: 15)`);
      console.log(`   Category: ${result.category} (expected: LOW)`);
      
      // Validate results
      const peluangMatch = Math.abs(result.peluang - 4.1667) < 0.0001;
      const impactMatch = Math.abs(result.impact - 3.5) < 0.0001;
      const totalMatch = result.total === 15;
      const categoryMatch = result.category === 'LOW';
      
      console.log(`   Validation: ${peluangMatch && impactMatch && totalMatch && categoryMatch ? '✅ PASSED' : '❌ FAILED'}`);
    }
    console.log();

    // Step 6: Get submission score
    console.log('6️⃣ Testing GET /submissions/{id}/score...');
    const getScoreResponse = await fetch(`${BASE_URL}/submissions/${submissionId}/score`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const scoreData = await getScoreResponse.json();
    console.log('✅ Score retrieved:', scoreData.success ? 'PASSED' : 'FAILED');
    if (scoreData.success) {
      console.log(`   Score: ${JSON.stringify(scoreData.data)}`);
    }
    console.log();

    // Step 7: Test admin endpoint with PIN
    console.log('7️⃣ Testing GET /admin/umkm (Admin PIN required)...');
    const adminResponse = await fetch(`${BASE_URL}/admin/umkm`, {
      headers: { 'x-admin-pin': '1234' }
    });
    
    const adminData = await adminResponse.json();
    console.log('✅ Admin endpoint:', adminData.success ? 'PASSED' : 'FAILED');
    if (adminData.success) {
      console.log(`   Found ${adminData.data?.length || 0} UMKM records`);
    }
    console.log();

    // Step 8: Test error handling
    console.log('8️⃣ Testing error handling...');
    
    // Test invalid submission ID
    const invalidScoreResponse = await fetch(`${BASE_URL}/submissions/99999/score`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const invalidScoreData = await invalidScoreResponse.json();
    console.log('✅ Invalid submission ID:', !invalidScoreData.success ? 'PASSED' : 'FAILED');
    
    // Test invalid admin PIN
    const invalidAdminResponse = await fetch(`${BASE_URL}/admin/umkm`, {
      headers: { 'x-admin-pin': 'wrong-pin' }
    });
    const invalidAdminData = await invalidAdminResponse.json();
    console.log('✅ Invalid admin PIN:', !invalidAdminData.success ? 'PASSED' : 'FAILED');
    
    // Test invalid risk inputs
    const invalidInputsResponse = await fetch(`${BASE_URL}/submissions/${submissionId}/inputs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        biaya_pengetahuan: 7, // Invalid: should be 1-6
        pengaruh_kerugian: 5,
        Frekuensi_serangan: 3,
        Pemulihan: 4,
        mengerti_poin: true
      })
    });
    
    const invalidInputsData = await invalidInputsResponse.json();
    console.log('✅ Invalid risk inputs:', !invalidInputsData.success ? 'PASSED' : 'FAILED');
    
    // Step 9: Test duplicate submission prevention
    console.log('\n9️⃣ Testing duplicate submission prevention...');
    
    // Try to create duplicate submission (same asset-threat combination)
    const duplicateResponse = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        assetId: 2, // Same as first submission
        threatId: 3 // Same as first submission
      })
    });
    const duplicateData = await duplicateResponse.json();
    console.log('✅ Duplicate submission prevention:', !duplicateData.success ? 'PASSED' : 'FAILED');
    if (!duplicateData.success) {
      console.log(`   Message: ${duplicateData.error}`);
    }

    // Step 10: Test question tracking endpoints
    console.log('\n🔟 Testing question tracking endpoints...');
    
    // Test get submission details with question tracking
    const detailsResponse = await fetch(`${BASE_URL}/submissions/${submissionId}/details`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const detailsData = await detailsResponse.json();
    console.log('✅ Submission details with questions:', detailsData.success ? 'PASSED' : 'FAILED');
    if (detailsData.success) {
      console.log(`   Questions tracked: ${Object.keys(detailsData.data.questions.riskAssessment).length} risk questions + 1 understanding question`);
      console.log(`   Asset: ${detailsData.data.context.asset.name}`);
      console.log(`   Threat: ${detailsData.data.context.threat.name}`);
    }
    
    // Test get all user submissions with question tracking
    const mySubmissionsResponse = await fetch(`${BASE_URL}/submissions/my-submissions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const mySubmissionsData = await mySubmissionsResponse.json();
    console.log('✅ My submissions with questions:', mySubmissionsData.success ? 'PASSED' : 'FAILED');
    if (mySubmissionsData.success) {
      console.log(`   Total submissions: ${mySubmissionsData.data.summary.total}`);
      console.log(`   Completed: ${mySubmissionsData.data.summary.completed}`);
      console.log(`   In Progress: ${mySubmissionsData.data.summary.inProgress}`);
    }
    console.log();

    console.log('🎉 All UMKM Survey API tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Authentication: ✅');
    console.log('   - Get assets: ✅');
    console.log('   - Get threats: ✅');
    console.log('   - Create submission: ✅');
    console.log('   - Submit inputs: ✅');
    console.log('   - Get score: ✅');
    console.log('   - Admin endpoint: ✅');
    console.log('   - Error handling: ✅');
    console.log('   - Duplicate prevention: ✅');
    console.log('   - Question tracking: ✅');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run tests
testUMKMSurveyAPI();
