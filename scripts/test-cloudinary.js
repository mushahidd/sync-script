/**
 * Test script to verify Cloudinary PDF configuration
 * Based on the video tutorial example
 * 
 * Run: node scripts/test-cloudinary.js
 */

// Load env from .env file (or .env.local if it exists)
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinarySetup() {
  console.log('\n🧪 Testing Cloudinary Configuration...\n');

  // Test 1: Check credentials
  console.log('1️⃣ Checking credentials:');
  const config = cloudinary.config();
  
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.log('❌ Missing Cloudinary credentials!');
    console.log('   Please set in .env.local:');
    console.log('   - CLOUDINARY_CLOUD_NAME');
    console.log('   - CLOUDINARY_API_KEY');
    console.log('   - CLOUDINARY_API_SECRET\n');
    return;
  }
  
  console.log('✅ Cloud Name:', config.cloud_name);
  console.log('✅ API Key:', config.api_key?.substring(0, 6) + '...');
  console.log('✅ API Secret:', config.api_secret ? '***' : 'NOT SET');

  // Test 2: Generate test URL
  console.log('\n2️⃣ Testing URL generation:');
  try {
    const testPublicId = 'syncscript_pdfs/test_file';
    const url = cloudinary.url(testPublicId, {
      resource_type: 'raw',
      type: 'upload',
      secure: true,
    });
    
    console.log('✅ Generated URL:', url);
  } catch (error) {
    console.log('❌ URL generation failed:', error.message);
  }

  // Test 3: Test API connection
  console.log('\n3️⃣ Testing API connection:');
  try {
    const result = await cloudinary.api.ping();
    if (result && result.status === 'ok') {
      console.log('✅ API connection successful!');
    } else {
      console.log('⚠️  API connection returned:', result);
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    console.log('   Check your credentials and internet connection.');
  }

  // Test 4: List resources (optional)
  console.log('\n4️⃣ Checking syncscript_pdfs folder:');
  try {
    const resources = await cloudinary.api.resources({
      resource_type: 'raw',
      type: 'upload',
      prefix: 'syncscript_pdfs',
      max_results: 5,
    });
    
    if (resources.resources && resources.resources.length > 0) {
      console.log(`✅ Found ${resources.resources.length} PDF(s) in folder:`);
      resources.resources.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.public_id}`);
      });
    } else {
      console.log('ℹ️  No PDFs found in syncscript_pdfs folder (this is normal for new setups)');
    }
  } catch (error) {
    console.log('⚠️  Could not list resources:', error.message);
  }

  console.log('\n✨ Test complete!\n');
}

// Run the test
testCloudinarySetup().catch(error => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});
