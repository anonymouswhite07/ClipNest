const express = require('express');
const router = express.Router();
const youtubedl = require('yt-dlp-exec');
const axios = require('axios');
const { validateURL, getPlatform } = require('../utils/urlHelper');

// @route   POST /api/v1/downloader/info
// @desc    Get media information (formats, thumbnail, title)
router.post('/info', async (req, res) => {
    const { url } = req.body;

    // Input Sanitization & Defense
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, message: 'Valid URL string is required' });
    }

    if (url.length > 2048) {
        return res.status(400).json({ success: false, message: 'URL is too long' });
    }

    if (!validateURL(url)) {
        return res.status(400).json({ success: false, message: 'Invalid or unsupported URL' });
    }

    console.log(`[API] Fetching info for URL: ${url}`);
    
    // Check if yt-dlp is available
    try {
        const bin = process.env.NODE_ENV === 'production' ? '/usr/local/bin/yt-dlp' : undefined;
        const { version } = await youtubedl.version({ binaryLocation: bin });
        console.log(`[API] yt-dlp Engine Version: ${version}`);
    } catch (vErr) {
        console.error(`[API] CRITICAL: yt-dlp engine not found or failed!`, vErr.message);
    }
    
    try {
        const platform = getPlatform(url);
        console.log(`[API] Detected Platform: ${platform}`);
        
        // Fetch metadata using yt-dlp
        const output = await youtubedl(url, {
            binaryLocation: process.env.NODE_ENV === 'production' ? '/usr/local/bin/yt-dlp' : undefined,
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            noSandbox: true,
            ignoreConfig: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            ]
        });
        
        console.log(`[API] Successfully extracted metadata for: ${output.title}`);

        // DEBUG: Inspect raw output in terminal
        console.log(`[Metadata Engine] Platform: ${platform} | Title: ${output.title}`);
        console.log(`[Metadata Engine] Stats -> Views: ${output.view_count}, Likes: ${output.like_count}`);

        // Filter and map formats
        const formats = output.formats
            .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
            .map(f => {
                const hasVideo = f.vcodec !== 'none';
                const hasAudio = f.acodec !== 'none';
                
                let qualityLabel = f.format_note || f.resolution || 'N/A';
                
                // Clean up technical terms for a professional UX
                if (qualityLabel.toLowerCase().includes('dash video')) qualityLabel = 'Video';
                if (qualityLabel.toLowerCase().includes('dash audio')) qualityLabel = 'Audio';
                
                return {
                    id: f.format_id,
                    extension: f.ext,
                    quality: qualityLabel,
                    filesize: f.filesize || f.filesize_approx || null,
                    vcodec: f.vcodec,
                    acodec: f.acodec,
                    url: f.url,
                    hasAudio,
                    hasVideo,
                    isComplete: hasVideo && hasAudio,
                    note: f.format_note || ''
                };
            })
            .filter(f => f.url);

        res.json({
            success: true,
            platform,
            metadata: {
                title: output.title,
                thumbnail: output.thumbnail,
                duration: output.duration,
                uploader: output.uploader,
                description: output.description?.substring(0, 200) + '...',
                views: output.view_count || null,
                likes: output.like_count || null,
                upload_date: output.upload_date || null
            },
            // Sort to put complete videos (with audio) first
            formats: formats.sort((a, b) => (b.isComplete - a.isComplete) || (b.filesize - a.filesize))
        });

    } catch (error) {
        console.error('yt-dlp error:', error);
        res.status(500).json({ 
            success: false, 
            message: `Extraction Error: ${error.message.split('\n')[0]}`,
            details: error.message 
        });
    }
});

// @route   GET /api/v1/downloader/proxy-image
// @desc    Proxy images to bypass CORS (Instagram/YouTube thumbnails)
router.get('/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string' || url.length > 2048) {
        return res.status(400).send('Valid URL is required and must be under 2048 characters');
    }

    try {
        const response = await axios({
            method: 'get',
            url: decodeURIComponent(url),
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.instagram.com/',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Image Error:', error.message);
        res.status(500).send('Failed to proxy image.');
    }
});

// @route   GET /api/v1/downloader/download
// @desc    Proxy the media stream to force download with clean filename
router.get('/download', async (req, res) => {
    const { url, title, ext } = req.query;

    if (!url || typeof url !== 'string' || url.length > 2048) {
        return res.status(400).send('Valid URL is required and must be under 2048 characters');
    }
    
    // Sanitize title to prevent header injection or filesystem issues
    const safeTitle = (title || 'video').toString().replace(/[^\w\s-]/gi, '').substring(0, 100);
    const safeExt = (ext || 'mp4').toString().replace(/[^a-z0-9]/gi, '').substring(0, 10);

    try {
        const response = await axios({
            method: 'get',
            url: decodeURIComponent(url),
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${safeExt}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Download Error:', error.message);
        res.status(500).send('Failed to stream media.');
    }
});

module.exports = router;
