document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ClipNest v1.2 Initialized');
    
    const urlInput = document.getElementById('urlInput');
    const fetchBtn = document.getElementById('fetchBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const loadingState = document.getElementById('loadingState');
    const resultContainer = document.getElementById('resultContainer');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const formatList = document.getElementById('formatList');

    // API Base URL (v1)
    const API_BASE = '/api/v1/downloader';

    // PWA: Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('✅ Service Worker Registered'))
            .catch(err => console.error('❌ SW Registration Failed:', err));
    }

    // PWA: Handle Shared Content
    const urlParams = new URLSearchParams(window.location.search);
    const sharedText = urlParams.get('text');
    const sharedUrl = urlParams.get('url');
    const sharedContent = sharedUrl || sharedText;

    if (sharedContent) {
        const urlMatch = sharedContent.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            urlInput.value = urlMatch[0];
            fetchMediaInfo();
        }
    }

    // Cookie Consent Banner Logic
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookieBanner.classList.remove('hidden'), 1500);
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.add('hidden');
    });

    /**
     * Helper Utilities (Hoisted)
     */
    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return h > 0 
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        const y = dateStr.substring(0, 4);
        const m = dateStr.substring(4, 6);
        const d = dateStr.substring(6, 8);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '--';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    /**
     * Core Functions
     */
    async function fetchMediaInfo() {
        const url = urlInput.value.trim();
        if (!url) {
            showToast('Please enter a URL');
            return;
        }

        resetUI();
        loadingState.classList.remove('hidden');
        fetchBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (data.success) {
                displayResults(data);
                // GA4: Track Successful Fetch
                gtag('event', 'media_fetch_success', {
                    'platform': data.platform,
                    'media_title': data.metadata.title
                });
            } else {
                showError(data.message || 'Unable to process this link.');
                // GA4: Track Failed Fetch
                gtag('event', 'media_fetch_error', {
                    'error_msg': data.message
                });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError(`Connection error: ${error.message || 'Check your internet or server status.'}`);
        } finally {
            loadingState.classList.add('hidden');
            fetchBtn.disabled = false;
        }
    }

    function displayResults(data) {
        const { metadata, formats } = data;
        let platform = data.platform;
        
        // Platform Fallback
        const currentUrl = urlInput.value.toLowerCase();
        if (!platform || platform === 'Unknown') {
            if (currentUrl.includes('instagram.com')) platform = 'Instagram';
            else if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) platform = 'YouTube';
            else if (currentUrl.includes('facebook.com') || currentUrl.includes('fb.watch')) platform = 'Facebook';
        }

        // Update Header
        const thumb = document.getElementById('thumbnail');
        const platformBadge = document.getElementById('platformBadge');
        const mediaDuration = document.getElementById('mediaDuration');
        
        platformBadge.textContent = platform || 'Media';
        platformBadge.className = `badge ${platform?.toLowerCase() || ''}`;

        thumb.src = `${API_BASE}/proxy-image?url=${encodeURIComponent(metadata.thumbnail)}`;
        thumb.alt = metadata.title;
        thumb.onerror = () => { thumb.src = 'https://via.placeholder.com/640x360?text=Preview+Available'; };

        document.getElementById('mediaTitle').textContent = metadata.title;
        document.getElementById('mediaUploader').innerHTML = `<span>By ${metadata.uploader || 'Unknown'}</span>`;

        // Render Stats Dashboard
        const duration = formatDuration(metadata.duration);
        const uploadDate = metadata.upload_date ? formatDate(metadata.upload_date) : null;
        
        mediaDuration.innerHTML = `
            <div class="stats-bar">
                <div class="stat-item"><i class="fa-regular fa-clock"></i> <span>${duration}</span></div>
                ${metadata.views ? `<div class="stat-item"><i class="fa-regular fa-eye"></i> <span>${formatNumber(metadata.views)} Views</span></div>` : 
                  (uploadDate ? `<div class="stat-item"><i class="fa-regular fa-calendar"></i> <span>${uploadDate}</span></div>` : '')}
                ${metadata.likes ? `<div class="stat-item"><i class="fa-regular fa-heart"></i> <span>${formatNumber(metadata.likes)} Likes</span></div>` : ''}
            </div>
        `;

        // Render Formats
        formatList.innerHTML = '';
        const uniqueFormats = filterFormats(formats);

        uniqueFormats.forEach(format => {
            const item = document.createElement('div');
            item.className = 'format-card';
            
            const hasVideo = format.hasVideo;
            const hasAudio = format.hasAudio;
            
            let audioStatus = '';
            if (!hasAudio && hasVideo) audioStatus = '<span class="audio-badge mute"><i class="fa-solid fa-volume-xmark"></i> Video without audio</span>';
            else if (hasAudio && hasVideo) audioStatus = '<span class="audio-badge"><i class="fa-solid fa-volume-high"></i> Video with audio</span>';
            else if (!hasVideo && hasAudio) audioStatus = '<span class="audio-badge audio-only"><i class="fa-solid fa-music"></i> Audio without video</span>';

            item.innerHTML = `
                <div class="format-left">
                    <span class="ext-tag">${format.extension}</span>
                    <span class="quality-text">${format.quality}</span>
                    ${audioStatus}
                </div>
                <div class="format-right"><span class="size-text">${formatBytes(format.filesize)}</span></div>
            `;

            item.onclick = () => downloadMedia(format.url, metadata.title, format.extension);
            formatList.appendChild(item);
        });

        resultContainer.classList.remove('hidden');
    }

    function filterFormats(formats) {
        const seen = new Set();
        return formats.filter(f => {
            const key = `${f.quality}-${f.extension}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 10);
    }

    function downloadMedia(url, title, ext) {
        // Show Ad Modal
        const adModal = document.getElementById('adModal');
        const adCountdown = document.getElementById('adCountdown');
        
        adModal.classList.remove('hidden');
        
        let timeLeft = 5;
        adCountdown.textContent = timeLeft;

        // Attempt to load AdSense ad (if not already pushed)
        try {
            const adContainer = adModal.querySelector('.adsbygoogle');
            if (adContainer && adContainer.innerHTML === "") {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.warn("AdSense error:", e);
        }

        const interval = setInterval(() => {
            timeLeft--;
            adCountdown.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                adModal.classList.add('hidden');
                executeDownload(url, title, ext);
            }
        }, 1000);
    }

    function executeDownload(url, title, ext) {
        showToast('Starting your download...');
        
        // GA4: Track Download Click
        gtag('event', 'media_download', {
            'media_title': title,
            'extension': ext
        });

        const downloadUrl = `${API_BASE}/download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&ext=${ext}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${title}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function resetUI() {
        resultContainer.classList.add('hidden');
        errorState.classList.add('hidden');
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorState.classList.remove('hidden');
    }

    function showToast(message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            showToast('Pasted from clipboard');
            fetchMediaInfo();
        } catch (err) {
            showToast('Unable to read clipboard. Please paste manually.');
        }
    });

    fetchBtn.onclick = fetchMediaInfo;
    urlInput.onkeypress = (e) => { if (e.key === 'Enter') fetchMediaInfo(); };
});
