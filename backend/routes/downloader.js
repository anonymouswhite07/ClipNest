const express = require('express');
const router = express.Router();
const { create } = require('yt-dlp-exec');
const axios = require('axios');
const { validateURL, getPlatform, normalizeURL } = require('../utils/urlHelper');

// Simple in-memory cache for successful extractions (TTL: 1 hour)
const extractionCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Use the manually installed binary in production, fallback to default in dev
const binPath = process.env.NODE_ENV === 'production' ? '/usr/local/bin/yt-dlp' : undefined;
const youtubedl = binPath ? create(binPath) : require('yt-dlp-exec');

// @route   POST /api/v1/downloader/info
// @desc    Get media information (formats, thumbnail, title)
router.post('/info', async (req, res) => {
    let { url } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, message: 'Valid URL string is required' });
    }

    if (!validateURL(url)) {
        return res.status(400).json({ success: false, message: 'Invalid or unsupported URL' });
    }

    url = normalizeURL(url);
    
    // 1. Check Cache
    const cachedData = extractionCache.get(url);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
        console.log(`[API] Cache Hit: ${url}`);
        return res.json(cachedData.data);
    }

    const platform = getPlatform(url);
    console.log(`[API] Fetching info: ${url} (${platform})`);

    // Temporary: YouTube coming soon
    if (platform === 'YouTube') {
        return res.json({
            success: false,
            message: 'YouTube Downloader is coming soon! We are upgrading our servers for HD quality.',
            platform: 'YouTube'
        });
    }

    try {
        // Simple, clean yt-dlp extraction — the "old method" that works
        const options = {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            ignoreConfig: true,
            noPlaylist: true,
            addHeader: [
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        };

        console.log(`[API] Extracting with yt-dlp for ${platform}...`);
        const output = await youtubedl(url, options);

        // Filter and map formats
        const formats = output.formats
            .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
            .map(f => {
                const hasVideo = f.vcodec !== 'none';
                const hasAudio = f.acodec !== 'none';
                let qualityLabel = f.format_note || f.resolution || 'N/A';
                
                const isVideoOnly = hasVideo && !hasAudio;
                const isAudioOnly = hasAudio && !hasVideo;
                const isComplete = hasVideo && hasAudio;
                
                if (isVideoOnly) qualityLabel += ' (No Audio)';
                if (isAudioOnly) qualityLabel = 'Audio Only (MP3/M4A)';
                if (isComplete && platform === 'Facebook') qualityLabel = f.format_note === 'hd' ? 'High Definition (Audio Incl.)' : 'Standard Quality (Audio Incl.)';
                
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
                    isComplete,
                    note: f.format_note || ''
                };
            })
            .filter(f => f.url && (f.hasAudio || f.hasVideo));

        const sortedFormats = formats.sort((a, b) => {
            if (a.isComplete && !b.isComplete) return -1;
            if (!a.isComplete && b.isComplete) return 1;
            return (b.filesize || 0) - (a.filesize || 0);
        });

        const responseData = {
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
            formats: sortedFormats
        };

        // 2. Save to Cache
        extractionCache.set(url, {
            timestamp: Date.now(),
            data: responseData
        });

        res.json(responseData);

    } catch (error) {
        console.error('Extraction Error:', error.message);
        
        // Clean error message — strip yt-dlp binary path noise
        let userMessage = error.message || 'Extraction failed.';
        if (userMessage.includes('ERROR:')) {
            userMessage = userMessage.split('ERROR:').pop().trim();
        }
        // Remove the binary path from the message
        userMessage = userMessage.replace(/Command failed.*?yt-dlp\s+/i, '');
        userMessage = userMessage.replace(/\/usr\/local\/bin\/yt-dlp\s*/g, '');
        userMessage = userMessage.replace(/--[\w-]+\s*/g, '');
        userMessage = userMessage.replace(/https?:\/\/\S+\s*/g, '');
        userMessage = userMessage.trim();

        // Make it user-friendly
        if (userMessage.includes('login required') || userMessage.includes('rate-limit')) {
            userMessage = 'This content requires login or is temporarily blocked. Please try a different link.';
        } else if (userMessage.includes('not available')) {
            userMessage = 'This content is not available. It might be private or removed.';
        } else if (!userMessage || userMessage.length < 5) {
            userMessage = 'Extraction failed. Please try a different link.';
        }

        res.json({ 
            success: false, 
            message: userMessage,
            platform: platform || 'Unknown'
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
