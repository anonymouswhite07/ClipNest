/**
 * Validates if the URL is supported
 * @param {string} url 
 * @returns {boolean}
 */
const validateURL = (url) => {
    const supportedPlatforms = [
        /youtube\.com/,
        /youtu\.be/,
        /instagram\.com/,
        /facebook\.com/,
        /fb\.watch/,
        /twitter\.com/,
        /tiktok\.com/
    ];
    
    try {
        const parsedUrl = new URL(url);
        return supportedPlatforms.some(pattern => pattern.test(parsedUrl.hostname));
    } catch (e) {
        return false;
    }
};

/**
 * Detects the platform from the URL
 * @param {string} url 
 * @returns {string}
 */
const getPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    if (url.includes('tiktok.com')) return 'TikTok';
    return 'Other';
};

/**
 * Normalizes URLs (e.g. converting Shorts to standard Watch URLs)
 * @param {string} url 
 * @returns {string}
 */
const normalizeURL = (url) => {
    try {
        if (url.includes('youtube.com/shorts/')) {
            const videoId = url.split('/shorts/')[1]?.split('?')[0];
            if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
    } catch (e) {
        return url;
    }
    return url;
};

module.exports = {
    validateURL,
    getPlatform,
    normalizeURL
};
