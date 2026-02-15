/**
 * TEST: Upload a sample PDF to verify everything works
 */

require('dotenv').config({ path: '.env' });
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  console.log('\n🧪 Testing PDF Upload with Correct Settings...\n');

  try {
    // Create a minimal test PDF file
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const testPdfPath = path.join(tmpDir, 'test-upload.pdf');
    
    // Create a minimal valid PDF
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n211\n%%EOF'
    );
    
    fs.writeFileSync(testPdfPath, pdfContent);
    console.log('✅ Created test PDF');

    // Upload with EXACT settings from video tutorial
    console.log('📤 Uploading to Cloudinary...\n');
    
    const result = await cloudinary.uploader.upload(testPdfPath, {
      folder: 'syncscript_pdfs',
      resource_type: 'raw',
      type: 'upload',
      access_mode: 'public',
      public_id: 'test-upload-' + Date.now(),
      use_filename: true,
      unique_filename: false,
    });

    console.log('✅ UPLOAD SUCCESSFUL!\n');
    console.log('📋 Upload Details:');
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Raw URL: ${result.secure_url}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Size: ${result.bytes} bytes`);
    console.log(`   Access Mode: ${result.access_mode || 'public (default)'}\n`);

    // Generate SIGNED URL (required for RAW files)
    console.log('🔐 Generating signed URL...');
    const signedUrl = cloudinary.url(result.public_id, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
    });
    
    console.log(`   Signed URL: ${signedUrl}\n`);

    // Test if SIGNED URL is accessible
    console.log('🌐 Testing SIGNED URL accessibility...');
    const https = require('https');
    
    const urlTest = await new Promise((resolve) => {
      https.get(signedUrl, (response) => {
        resolve(response.statusCode);
      }).on('error', () => {
        resolve('error');
      });
    });

    if (urlTest === 200) {
      console.log('✅ URL IS ACCESSIBLE! (HTTP 200)');
      console.log('\n🎉 PERFECT! Your upload code is working correctly!');
      console.log('💡 You can now upload PDFs in your app and they will work!\n');
    } else {
      console.log(`❌ URL returned: ${urlTest}`);
      console.log('   There may still be an issue.\n');
    }

    // Cleanup
    fs.unlinkSync(testPdfPath);
    console.log('🧹 Cleaned up test file\n');
    
    // Delete test PDF from Cloudinary
    await cloudinary.uploader.destroy(result.public_id, {
      resource_type: 'raw',
      invalidate: true,
    });
    console.log('🧹 Deleted test PDF from Cloudinary\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testUpload();
