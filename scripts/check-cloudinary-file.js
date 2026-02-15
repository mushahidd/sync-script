const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

async function checkFile() {
  // Get the problematic file from DB
  const file = await prisma.fileUpload.findUnique({
    where: { id: '2a48cbc4-b357-4bbf-a73d-76cb6bd266ca' }
  });
  
  if (!file) {
    console.log('File not found in database');
    await prisma.$disconnect();
    return;
  }
  
  console.log('Database record:');
  console.log('  fileName:', file.fileName);
  console.log('  publicId:', file.publicId);
  console.log('  fileUrl:', file.fileUrl);
  console.log('');
  
  // Try to get the resource from Cloudinary (raw type)
  try {
    console.log('Checking Cloudinary for RAW resource...');
    const resource = await cloudinary.api.resource(file.publicId, {
      resource_type: 'raw'
    });
    console.log('✅ Found as RAW type!');
    console.log('  Format:', resource.format);
    console.log('  Secure URL:', resource.secure_url);
  } catch (err) {
    console.log('❌ Not found as RAW type');
    console.log('  Error:', err.error?.message || err.message);
  }
  
  console.log('');
  
  // Try image type
  try {
    console.log('Checking Cloudinary for IMAGE resource...');
    const resource = await cloudinary.api.resource(file.publicId, {
      resource_type: 'image'
    });
    console.log('✅ Found as IMAGE type!');
    console.log('  Format:', resource.format);
    console.log('  Secure URL:', resource.secure_url);
  } catch (err) {
    console.log('❌ Not found as IMAGE type');
    console.log('  Error:', err.error?.message || err.message);
  }
  
  // Also try without the .pdf extension
  const publicIdWithoutExt = file.publicId.replace(/\.pdf$/, '');
  if (publicIdWithoutExt !== file.publicId) {
    console.log('');
    console.log(`Trying without extension: "${publicIdWithoutExt}"`);
    
    try {
      const resource = await cloudinary.api.resource(publicIdWithoutExt, {
        resource_type: 'image'
      });
      console.log('✅ Found IMAGE without extension!');
      console.log('  Secure URL:', resource.secure_url);
    } catch (err) {
      console.log('❌ Not found');
    }
  }
  
  await prisma.$disconnect();
}

checkFile();
