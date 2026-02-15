/**
 * Fix existing PDFs in Cloudinary by updating their access mode to public
 * This fixes the 401 Unauthorized error for PDFs uploaded before the fix
 * 
 * Run: node scripts/fix-existing-pdfs.js
 */

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fixExistingPdfs() {
  console.log('\n🔧 Fixing Existing PDFs in Cloudinary...\n');

  try {
    // Get all PDFs in syncscript_pdfs folder
    console.log('📂 Fetching PDFs from Cloudinary...');
    const resources = await cloudinary.api.resources({
      resource_type: 'raw',
      type: 'upload',
      prefix: 'syncscript_pdfs',
      max_results: 500, // Adjust if you have more PDFs
    });

    if (!resources.resources || resources.resources.length === 0) {
      console.log('ℹ️  No PDFs found in syncscript_pdfs folder');
      return;
    }

    console.log(`✅ Found ${resources.resources.length} PDF(s)\n`);

    let fixedCount = 0;
    let errorCount = 0;

    // Fix each PDF
    for (const resource of resources.resources) {
      const publicId = resource.public_id;
      console.log(`📄 Processing: ${publicId}`);

      try {
        // Update the resource to make it public
        const result = await cloudinary.uploader.explicit(publicId, {
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
        });

        if (result.access_mode === 'public') {
          console.log(`   ✅ Fixed! Now accessible at: ${result.secure_url}\n`);
          fixedCount++;
        } else {
          console.log(`   ⚠️  Warning: Access mode is ${result.access_mode}\n`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`Total PDFs: ${resources.resources.length}`);
    console.log(`✅ Fixed: ${fixedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (fixedCount > 0) {
      console.log('🎉 Success! All PDFs should now be accessible.');
      console.log('💡 Try opening your PDFs in the browser - they should work now!\n');
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error('   Check your Cloudinary credentials and try again.\n');
    process.exit(1);
  }
}

// Run the script
fixExistingPdfs().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
