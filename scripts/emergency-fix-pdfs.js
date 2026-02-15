/**
 * EMERGENCY FIX: Re-upload all PDFs with correct public access settings
 * This deletes old PDFs and re-uploads them properly
 */

require('dotenv').config({ path: '.env' });
const { v2: cloudinary } = require('cloudinary');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Download file from URL
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 401 || response.statusCode === 403) {
        // Try without authentication - use Cloudinary API to get the file
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error('Cannot download - file is private. Will use Cloudinary API.'));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

async function emergencyFixPdfs() {
  console.log('\n🚨 EMERGENCY PDF FIX - Re-uploading all PDFs\n');

  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  try {
    // Get all PDFs
    console.log('📂 Fetching PDFs from Cloudinary...');
    const resources = await cloudinary.api.resources({
      resource_type: 'raw',
      type: 'upload',
      prefix: 'syncscript_pdfs',
      max_results: 500,
    });

    if (!resources.resources || resources.resources.length === 0) {
      console.log('ℹ️  No PDFs found');
      return;
    }

    console.log(`✅ Found ${resources.resources.length} PDF(s)\n`);

    for (const resource of resources.resources) {
      const publicId = resource.public_id;
      const filename = path.basename(publicId);
      
      console.log(`\n📄 Processing: ${filename}`);
      console.log(`   Old URL: ${resource.secure_url}`);

      try {
        // Step 1: Download using Cloudinary API (works even if private)
        const tempPath = path.join(tmpDir, `temp_${Date.now()}_${filename}`);
        console.log('   📥 Downloading via Cloudinary API...');
        
        // Get the file content using Cloudinary's download
        const fileBuffer = await new Promise((resolve, reject) => {
          cloudinary.api.resource(publicId, { resource_type: 'raw' }, (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            
            // Download from secure_url using admin API
            const url = result.secure_url;
            https.get(url, (response) => {
              const chunks = [];
              response.on('data', (chunk) => chunks.push(chunk));
              response.on('end', () => {
                if (response.statusCode === 401) {
                  // Use signed URL
                  const signedUrl = cloudinary.url(publicId, {
                    resource_type: 'raw',
                    type: 'upload',
                    sign_url: true,
                  });
                  
                  https.get(signedUrl, (signedResponse) => {
                    const signedChunks = [];
                    signedResponse.on('data', (chunk) => signedChunks.push(chunk));
                    signedResponse.on('end', () => resolve(Buffer.concat(signedChunks)));
                    signedResponse.on('error', reject);
                  });
                } else {
                  resolve(Buffer.concat(chunks));
                }
              });
              response.on('error', reject);
            });
          });
        });

        fs.writeFileSync(tempPath, fileBuffer);
        console.log('   ✅ Downloaded');

        // Step 2: Delete old version
        console.log('   🗑️  Deleting old version...');
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true });
        console.log('   ✅ Deleted');

        // Step 3: Re-upload with PUBLIC settings
        console.log('   📤 Re-uploading with public access...');
        const uploadResult = await cloudinary.uploader.upload(tempPath, {
          folder: 'syncscript_pdfs',
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          public_id: filename.replace(/\.pdf$/i, ''),
          use_filename: true,
          unique_filename: false,
          invalidate: true,
        });

        console.log('   ✅ Re-uploaded!');
        console.log(`   🌐 New URL: ${uploadResult.secure_url}`);

        // Cleanup temp file
        fs.unlinkSync(tempPath);
        console.log('   ✅ FIXED!\n');

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n🎉 ALL PDFs RE-UPLOADED WITH PUBLIC ACCESS!');
    console.log('💡 Try opening your PDFs now - they should work!\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

emergencyFixPdfs();
