const seoRoutes = {
    '/': {
        title: 'ClipNest | Premium Video Downloader for YouTube, Instagram & Facebook',
        description: 'Download high-quality videos from YouTube, Instagram, and Facebook for free. Fast, secure, and no registration required. Support for MP4, MP3, and 4K.',
        h1: 'Premium <span class="gradient-text">Media Downloader</span>',
        subtitle: 'The fastest way to save your favorite content from the web.',
        platform: 'YouTube or Instagram',
        faqs: [
            { q: 'Is ClipNest free to use?', a: 'Yes, ClipNest is 100% free with no hidden charges or limits on downloads.' },
            { q: 'What platforms are supported?', a: 'We currently support YouTube, Instagram (Reels/Stories), and Facebook video extraction.' },
            { q: 'Do I need to install any software?', a: 'No, ClipNest is a web-based tool. You can download videos directly in your browser.' }
        ],
        guide: [
            { step: '1', title: 'Copy URL', text: 'Find the video or reel you want to download and copy its URL from the address bar or share menu.' },
            { step: '2', title: 'Paste Link', text: 'Paste the link into the search box above. ClipNest will automatically analyze the media source.' },
            { step: '3', title: 'Choose Quality', text: 'Select your preferred format (MP4 or MP3) and quality (HD, 4K, or 320kbps).' },
            { step: '4', title: 'Download', text: 'Click the download button and save the file directly to your device.' }
        ]
    },
    '/youtube-downloader': {
        title: 'YouTube Video Downloader - Download YT Videos in HD & 4K',
        description: 'Fastest YouTube video downloader. Save YouTube videos to MP4 or MP3 in high quality. No software needed, works on mobile and desktop.',
        h1: 'YouTube <span class="gradient-text">Video Downloader</span>',
        subtitle: 'High-speed YouTube extraction for offline viewing.',
        platform: 'YouTube',
        faqs: [
            { q: 'Can I download YouTube videos in 4K?', a: 'Yes, if the original video supports 4K, ClipNest allows you to select and download it in full resolution.' },
            { q: 'Is it legal to download YouTube videos?', a: 'Downloading videos for personal, offline use is generally accepted, but you must respect the content creator\'s copyright.' },
            { q: 'How do I download YouTube as MP3?', a: 'Paste the link, wait for the analysis, and select the MP3 format from the options provided.' }
        ],
        guide: [
            { step: '1', title: 'Find Video', text: 'Navigate to YouTube and copy the link of the video you wish to save.' },
            { step: '2', title: 'Process Link', text: 'Enter the URL into ClipNest. Our engine will fetch all available formats in seconds.' },
            { step: '3', title: 'Select Format', text: 'Pick between MP4 (video) or MP3 (audio only) based on your needs.' },
            { step: '4', title: 'Save File', text: 'Hit download and enjoy your YouTube content offline anywhere.' }
        ]
    },
    '/youtube-to-mp3': {
        title: 'YouTube to MP3 Converter - High Quality 320kbps Audio',
        description: 'Convert YouTube videos to MP3 audio files instantly. Best quality 320kbps MP3 downloader for music, podcasts, and lectures.',
        h1: 'YouTube to <span class="gradient-text">MP3 Converter</span>',
        subtitle: 'Extract crystal-clear audio from any YouTube video.',
        platform: 'YouTube',
        faqs: [
            { q: 'What is the highest MP3 quality available?', a: 'ClipNest supports up to 320kbps MP3 extraction for the best possible audio experience.' },
            { q: 'Can I convert long podcasts to MP3?', a: 'Yes, our server-side engine can handle long-form content including podcasts and lectures.' }
        ],
        guide: [
            { step: '1', title: 'Copy YT Link', text: 'Copy the URL of the YouTube video you want to convert to audio.' },
            { step: '2', title: 'Paste to ClipNest', text: 'Use our optimized MP3 converter tool by pasting the link above.' },
            { step: '3', title: 'Check Quality', text: 'Ensure the 320kbps or High Quality option is selected for best sound.' },
            { step: '4', title: 'Download Audio', text: 'The conversion is instant. Save your new MP3 file immediately.' }
        ]
    },
    '/instagram-downloader': {
        title: 'Instagram Downloader - Save Reels, Stories & Photos',
        description: 'Download Instagram Reels, Stories, and IGTV videos in one click. High-quality Instagram video saver for mobile and desktop.',
        h1: 'Instagram <span class="gradient-text">Downloader</span>',
        subtitle: 'Save Reels and Stories directly to your gallery.',
        platform: 'Instagram',
        faqs: [
            { q: 'Can I download Instagram Stories?', a: 'Yes, as long as the account is public, you can paste the story link and save it.' },
            { q: 'How to save Instagram Reels?', a: 'Simply copy the Reel link from the Instagram app and paste it into ClipNest.' }
        ],
        guide: [
            { step: '1', title: 'Get Reel Link', text: 'Open Instagram, tap the share icon on a Reel, and select "Copy Link".' },
            { step: '2', title: 'Paste & Analyze', text: 'Paste the Instagram link into ClipNest and let us fetch the high-quality source.' },
            { step: '3', title: 'Preview Media', text: 'View the thumbnail to ensure it\'s the correct content you want to save.' },
            { step: '4', title: 'Download Reel', text: 'Save the Instagram video in MP4 format directly to your device.' }
        ]
    },
    '/facebook-downloader': {
        title: 'Facebook Video Downloader - Save FB Videos in Full HD',
        description: 'Download Facebook videos in HD and SD quality. Safe and fast FB video saver for personal use. Works on Android and iOS.',
        h1: 'Facebook <span class="gradient-text">Video Downloader</span>',
        subtitle: 'The easiest way to save videos from your Facebook feed.',
        platform: 'Facebook',
        faqs: [
            { q: 'Can I download private Facebook videos?', a: 'No, for security and privacy reasons, ClipNest only supports publicly accessible Facebook content.' },
            { q: 'Does it work on mobile?', a: 'Absolutely! ClipNest is fully optimized for Chrome, Safari, and other mobile browsers.' }
        ],
        guide: [
            { step: '1', title: 'Copy FB Video URL', text: 'Right-click the video on Facebook or use the share button to copy the link.' },
            { step: '2', title: 'Enter Link', text: 'Paste the Facebook link into the ClipNest search bar.' },
            { step: '3', title: 'Select Quality', text: 'Choose between HD (High Definition) or SD (Standard Definition) quality.' },
            { step: '4', title: 'Instant Save', text: 'Click download to save the Facebook video to your computer or phone.' }
        ]
    }
};

module.exports = seoRoutes;
