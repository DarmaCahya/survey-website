#!/bin/bash

# Script to test the updated submissions endpoint
# This script tests the new feedback functionality

echo "🧪 Testing Updated Submissions Endpoint..."
echo "=========================================="

# Test 1: Get submissions (requires valid token)
echo "📋 Test 1: Get submissions endpoint"
echo "Note: This requires a valid user token"
echo "curl -X GET 'http://localhost:3000/api/form/submissions' -H 'Authorization: Bearer <user_token>'"
echo ""

# Test 2: Get submissions with filters
echo "📋 Test 2: Get submissions with filters"
echo "curl -X GET 'http://localhost:3000/api/form/submissions?understandLevel=TIDAK_MENGERTI' -H 'Authorization: Bearer <user_token>'"
echo ""

# Test 3: Get submissions with feedback
echo "📋 Test 3: Get submissions with feedback"
echo "curl -X GET 'http://localhost:3000/api/form/submissions?includeFeedback=true' -H 'Authorization: Bearer <user_token>'"
echo ""

# Test 4: Submit inputs with feedback (example)
echo "📋 Test 4: Submit inputs with feedback"
echo "curl -X POST 'http://localhost:3000/api/form/submissions/1/inputs' \\"
echo "  -H 'Authorization: Bearer <user_token>' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"biaya_pengetahuan\": 3,"
echo "    \"pengaruh_kerugian\": 4,"
echo "    \"Frekuensi_serangan\": 2,"
echo "    \"Pemulihan\": 3,"
echo "    \"mengerti_poin\": false,"
echo "    \"Tidak_mengerti_poin\": \"Frekuensi Serangan\","
echo "    \"description_tidak_mengerti\": \"Saya tidak mengerti bagaimana cara menghitung frekuensi serangan\""
echo "  }'"
echo ""

echo "✅ Testing instructions provided!"
echo ""
echo "📊 New Features Available:"
echo "   - Detailed understanding analysis"
echo "   - Feedback categorization by type"
echo "   - Understanding gap identification"
echo "   - Integration with analytics endpoints"
echo ""
echo "🔍 To test with real data:"
echo "   1. Create a user account"
echo "   2. Login to get a valid token"
echo "   3. Create submissions with feedback"
echo "   4. Use the GET endpoint to retrieve detailed feedback analysis"
