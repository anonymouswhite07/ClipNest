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

module.exports = {
    validateURL,
    getPlatform
};
