# 🦅 ClipNest | Ultra-Premium Media Downloader

ClipNest is the ultimate, high-performance media extraction engine designed for those who demand the best. Experience publicly accessible media from YouTube, Instagram, and more in a stunning $10,000-tier interface.

![StreamVault Preview](https://via.placeholder.com/1200x600/0f172a/8b5cf6?text=StreamVault+Premium+UI)

## ✨ Features
- **Smart Detection**: Automatically detects platform (YouTube, Instagram, etc.)
- **Quality Control**: Choose from multiple resolutions and formats (MP4, WebM, Audio only).
- **Cinematic UI**: Dark theme with glassmorphism, smooth animations, and interactive elements.
- **Drag & Drop**: Simply drag a URL into the input field to start.
- **Privacy First**: No account required. Only downloads public content.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (The backend uses `yt-dlp-exec` which tries to find or download it automatically)

### 1. Clone & Install Dependencies
```bash
# Navigate to the project directory
cd insta-and-yt-videodownloader

# Install dependencies
npm install
```

### 2. Run the Application
```bash
# Start the backend server
npm start
```
The server will start at `http://localhost:5000`.

### 3. Open in Browser
Open your browser and navigate to `http://localhost:5000`.

---

## 📁 Project Structure
- `frontend/`: UI implementation (HTML, CSS, JS)
- `backend/`: Node.js server and API routes
- `backend/routes/`: Platform handling logic
- `backend/utils/`: URL validation and helpers

---

## 🛡️ Safety & Compliance
- **Disclaimer**: This tool is for personal use only. Download only content you own or have explicit permission to use.
- **Respect Terms**: We do not bypass login walls or download private content.
- **Copyright**: Respect the intellectual property of creators.

---

## ⚡ API Flow Example
1. **Request**: `POST /api/downloader/info` with `{ "url": "..." }`
2. **Backend**: Validates URL -> Executes `yt-dlp` -> Fetches metadata and formats.
3. **Response**: Returns JSON with title, thumbnail, and a list of direct stream URLs for the browser to download.

---
Created with ❤️ by Antigravity
