const axios = require('axios');
const REEL_URL = 'https://www.instagram.com/reel/DW5pEGtkag6/';

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/v1/downloader/info', { url: REEL_URL });
        console.log('Result:', JSON.stringify(res.data.metadata, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
