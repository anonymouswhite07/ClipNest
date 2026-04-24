const youtubedl = require('yt-dlp-exec');

async function testTikTok() {
    const url = 'https://www.tiktok.com/@tiktok/video/7106594312292453678'; // Example official TikTok video
    try {
        console.log('Fetching TikTok metadata...');
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true
        });
        
        console.log('--- SUCCESS ---');
        console.log('Title:', output.title);
        console.log('Uploader:', output.uploader);
        console.log('Duration:', output.duration);
        console.log('Views:', output.view_count);
        console.log('Likes:', output.like_count);
        console.log('Thumbnail:', output.thumbnail);
        console.log('Formats count:', output.formats ? output.formats.length : 0);
        
        if (output.formats && output.formats.length > 0) {
            console.log('Sample format:', {
                ext: output.formats[0].ext,
                format_id: output.formats[0].format_id,
                vcodec: output.formats[0].vcodec,
                acodec: output.formats[0].acodec
            });
        }
        
    } catch (e) {
        console.error('--- ERROR ---');
        console.error(e.message);
    }
}

testTikTok();
