#!/bin/bash

# Script to run the real data seeder on the server
# This script should be run on the Ubuntu server where the application is deployed

echo "🚀 Starting UMKM Survey Real Data Seeding..."
echo "=============================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Docker containers are running
echo "📋 Checking Docker containers..."
if ! docker ps | grep -q "survey-app"; then
    echo "❌ Error: Survey app container is not running. Please start the containers first."
    echo "Run: docker-compose up -d"
    exit 1
fi

if ! docker ps | grep -q "survey-postgres"; then
    echo "❌ Error: PostgreSQL container is not running. Please start the containers first."
    echo "Run: docker-compose up -d"
    exit 1
fi

echo "✅ Docker containers are running"

# Run the seeder inside the app container
echo "🌱 Running real data seeder..."
docker exec survey-app npm run seed:real-data

if [ $? -eq 0 ]; then
    echo "=============================================="
    echo "✅ Real data seeding completed successfully!"
    echo "🎯 The database now contains the actual UMKM survey data"
    echo ""
    echo "📊 You can now:"
    echo "   - Access the survey with real assets and threats"
    echo "   - View analytics at /api/form/admin/analytics"
    echo "   - View feedback analytics at /api/form/admin/feedback"
    echo ""
    echo "🔍 To verify the data, you can:"
    echo "   - Check the survey page to see the new assets"
    echo "   - Use the admin endpoints to view analytics"
else
    echo "=============================================="
    echo "❌ Real data seeding failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi
