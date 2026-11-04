# 🎬 ShortsForge: AI YouTube to Vertical Shorts Repurposer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.38+-FF4B4B.svg)](https://streamlit.io/)
[![yt-dlp](https://img.shields.io/badge/yt--dlp-2024.8+-red.svg)](https://github.com/yt-dlp/yt-dlp)
[![Whisper](https://img.shields.io/badge/Whisper-faster--whisper-green.svg)](https://github.com/SYSTRAN/faster-whisper)

A 100% free, production-ready, open-source pipeline that automatically repurposes long-form YouTube videos into vertical YouTube Shorts, TikToks, and Instagram Reels with dynamic, word-level animated karaoke subtitles and center-focused 9:16 aspect ratio framing.

---

## 🌟 Key Features

1. **Smart Chunk Downloading (`yt-dlp`)**: Streams only the requested timestamp segment using `download_ranges` without wasting bandwidth or downloading 1-hour source files.
2. **Dynamic Aspect Ratio Framing (`FFmpeg`)**: Converts horizontal 16:9 videos into 9:16 vertical shorts (1080x1920) or 1:1 squares with dynamic center cropping and pristine H.264/AAC encoding.
3. **Word-Level Animated Subtitles (`faster-whisper` / `whisper`)**: Transcribes audio and generates styled `.ass` subtitles with bottom-center alignment, heavy outline, and active word color highlights (Yellow, Cyan, Neon Green).
4. **Hardcoded Burn-in (`FFmpeg`)**: Burns subtitles directly into the video stream for seamless display on all mobile players with zero audio drift.
5. **Zero Paid APIs**: Runs 100% locally or on Hugging Face Spaces with free CPU or GPU compute.
6. **Automatic Cleanup**: Removes all intermediate crops, audio extractions, and temporary cuts to maintain low disk usage.

---

## 🚀 Quick Setup Instructions

### 1. Windows Installation

#### Prerequisites:
1. Install **Python 3.10 or 3.11** from [python.org](https://www.python.org/downloads/) (Make sure to check *"Add Python to PATH"* during install).
2. Install **FFmpeg**:
   - Open PowerShell as Administrator and run:
     ```powershell
     winget install "Gyan.FFmpeg"
     # or via Chocolatey:
     choco install ffmpeg
     ```
   - Verify installation:
     ```powershell
     ffmpeg -version
     ```

#### Step-by-Step Commands:
```powershell
# 1. Clone the repository
git clone https://github.com/your-username/shortsforge.git
cd shortsforge

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4. Launch the Streamlit application
streamlit run app.py
```

---

### 2. macOS Installation (Apple Silicon M1/M2/M3 & Intel)

#### Prerequisites:
1. Install Homebrew (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Install FFmpeg and Python:
   ```bash
   brew install ffmpeg python@3.10
   ```

#### Step-by-Step Commands:
```bash
# 1. Clone the repository
git clone https://github.com/your-username/shortsforge.git
cd shortsforge

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Run the app
streamlit run app.py
```

---

### 3. Linux (Ubuntu / Debian)

```bash
# 1. Install system dependencies (FFmpeg + fonts)
sudo apt update && sudo apt install -y ffmpeg libsm6 libxext6 fonts-liberation fonts-dejavu-core python3-pip python3-venv

# 2. Clone and navigate to repo
git clone https://github.com/your-username/shortsforge.git
cd shortsforge

# 3. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 4. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Run application
streamlit run app.py --server.port 8501 --server.address 0.0.0.0
```

---

### 4. Deploying to Hugging Face Spaces (CPU or T4 GPU)

Hugging Face Spaces supports Streamlit out of the box with zero configuration!

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **"Create new Space"**.
2. Settings:
   - **Space Name:** `shortsforge-repurposer`
   - **Space SDK:** Select **Streamlit**
   - **Hardware:**
     * **CPU Basic (2 vCPU, 16GB RAM)**: 100% Free!
     * **T4 GPU (16GB)**: For ~5x faster Whisper transcription and FFmpeg encoding.
3. Push the files into the Space repository:
   - `app.py`
   - `requirements.txt`
   - `packages.txt` (Hugging Face automatically installs `ffmpeg` and required fonts from this file!)
   - `README.md`
4. Hugging Face Spaces will automatically build the environment, install FFmpeg, download the base Whisper model, and launch the web UI!

---

### 5. Docker Deployment (Optional)

```dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-liberation \
    fonts-dejavu-core \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

Build and run:
```bash
docker build -t shortsforge .
docker run -p 8501:8501 shortsforge
```

---

## 🛠️ Architecture Deep-Dive

```
                                [ YouTube Video ]
                                        │
                                        ▼
                         [ yt-dlp download_ranges ]
                                        │
                         (Extracts ONLY target timestamp)
                                        │
                                        ▼
                         [ FFmpeg Center-Crop & Scale ]
                         (16:9 ➔ 9:16 vertical 1080x1920)
                                        │
                   ┌────────────────────┴────────────────────┐
                   ▼                                         ▼
            [ Cropped Video ]                        [ Extracted Audio ]
                   │                                         │
                   │                                         ▼
                   │                             [ Whisper Speech-to-Text ]
                   │                               (Word-level timestamps)
                   │                                         │
                   │                                         ▼
                   │                               [ Dynamic .ASS Script ]
                   │                           (Karaoke highlighting tag {\k})
                   │                                         │
                   └────────────────────┬────────────────────┘
                                        ▼
                         [ FFmpeg Subtitle Burn-In ]
                         (libx264 hardcoded subtitles)
                                        │
                                        ▼
                             [ Final 9:16 Short MP4 ]
```

---

## ⚙️ Configuration & Customization

| Parameter | Options | Description |
|-----------|---------|-------------|
| **Aspect Ratio** | `9:16`, `1:1`, `16:9` | Crop framing for TikTok/Shorts or Instagram feed |
| **Subtitle Highlight** | `Yellow`, `Cyan`, `Green` | Color of the currently spoken active word |
| **Font Size** | `Small (48pt)`, `Medium (60pt)`, `Large (74pt)` | Scaled for 1080x1920 vertical format |
| **Max Clip Duration** | Up to 90 seconds | Optimal viral retention length |

---

## 📄 License
This project is released under the **MIT License**. Free for personal and commercial usage.
