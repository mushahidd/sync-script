const fetch = require('node-fetch');

async function testUrl() {
  const url = 'https://res.cloudinary.com/dc1mf6ihn/raw/upload/v1771102235/syncscript_pdfs/Case%20Study%20Challenge%20_%20Web%20Development%20%283%29.pdf';
  
  console.log('Testing URL:', url);
  console.log('');
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error response:', text);
    } else {
      console.log('✅ File is accessible!');
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'));
    }
  } catch (error) {
    console.error('Fetch failed:', error.message);
  }
}

testUrl();
