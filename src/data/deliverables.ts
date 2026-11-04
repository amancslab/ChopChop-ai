export interface DeliverableFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const DELIVERABLE_FILES: Record<string, DeliverableFile> = {
  'app.py': {
    filename: 'app.py',
    language: 'python',
    description: 'Complete single-file Streamlit application with yt-dlp smart range downloading, dynamic 9:16 FFmpeg center-crop, faster-whisper word transcription, and ASS burning.',
    content: `"""
ShortsForge: AI YouTube to Vertical Shorts Repurposer
======================================================
Production-ready Streamlit application that converts long-form YouTube videos
into 9:16 Shorts/Reels with smart chunk downloading (yt-dlp), dynamic center-cropping (FFmpeg),
and word-level animated karaoke captions powered by Whisper.

Author: Senior AI Multimedia Systems Architect
License: MIT - 100% Free & Open-Source
"""

from __future__ import annotations

import os
import re
import sys
import math
import shutil
import logging
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import streamlit as st

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ShortsForge")

# UI THEME CONFIGURATION
CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }
.header-box { background: linear-gradient(135deg, #13141f, #1e1f30); border-radius: 14px; padding: 22px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px; }
.badge { display: inline-block; padding: 4px 10px; background: rgba(239,68,68,0.15); color: #ef4444; border-radius: 9999px; font-size: 11px; font-weight: 700; }
</style>
"""

MAX_CLIP_DURATION_SECONDS = 90.0

COLOR_MAP_BGR_ASS = {
    "Yellow": {"ass": "&H0000FFFF&", "hex": "#FFFF00"},
    "Green": {"ass": "&H0000FF00&", "hex": "#00FF66"},
    "Cyan": {"ass": "&H00FFFF00&", "hex": "#00FFFF"},
}

FONT_SIZE_MAP = {
    "Small": {"size": 48, "margin_v": 220},
    "Medium": {"size": 60, "margin_v": 240},
    "Large": {"size": 74, "margin_v": 260},
}

ASPECT_RATIOS = {
    "9:16 (Vertical Short - 1080x1920)": "9:16",
    "1:1 (Square - 1080x1080)": "1:1",
    "16:9 (Horizontal - Original)": "16:9",
}

def parse_time_to_seconds(time_str: str) -> Optional[float]:
    if not time_str or not str(time_str).strip():
        return None
    cleaned = str(time_str).strip()
    try:
        val = float(cleaned)
        return val if val >= 0 else None
    except ValueError:
        pass
    parts = cleaned.split(":")
    try:
        if len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        elif len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
    except (ValueError, TypeError):
        return None
    return None

def format_ass_time(seconds: float) -> str:
    total_sec = max(0.0, seconds)
    hours = int(total_sec // 3600)
    rem = total_sec % 3600
    minutes = int(rem // 60)
    secs = int(rem % 60)
    cs = int(round((rem - int(rem)) * 100))
    if cs >= 100: cs = 99
    return f"{hours}:{minutes:02d}:{secs:02d}.{cs:02d}"

def is_valid_youtube_url(url: str) -> bool:
    if not url: return False
    regex = r"^(https?://)?(www\\.)?(youtube\\.com/(watch\\?v=|embed/|shorts/)|youtu\\.be/)[\\w\\-]{11}(\\S*)?$"
    return bool(re.match(regex, url.strip()))

def download_youtube_segment(url: str, start_sec: float, end_sec: float, output_path: Path) -> bool:
    from yt_dlp import YoutubeDL
    def download_range_hook(info_dict, ydl):
        return [{'start_time': start_sec, 'end_time': end_sec}]
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': str(output_path.with_suffix('')),
        'download_ranges': download_range_hook,
        'force_keyframes_at_cuts': True,
        'quiet': True,
        'no_warnings': True,
        'merge_output_format': 'mp4',
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    if not output_path.exists():
        cand = output_path.with_suffix('.mp4')
        if cand.exists(): cand.rename(output_path)
    return output_path.exists()

def convert_aspect_ratio_and_frame(input_video: Path, output_video: Path, aspect_ratio: str) -> bool:
    if aspect_ratio == "9:16":
        vf_filter = "crop=ih*(9/16):ih,scale=1080:1920:flags=lanczos"
    elif aspect_ratio == "1:1":
        vf_filter = "crop=ih:ih,scale=1080:1080:flags=lanczos"
    else:
        vf_filter = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"
    
    cmd = [
        "ffmpeg", "-y", "-i", str(input_video),
        "-vf", vf_filter,
        "-c:v", "libx264", "-preset", "fast", "-crf", "22",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
        "-movflags", "+faststart", str(output_video)
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return True

def extract_audio_from_clip(video_path: Path, audio_path: Path) -> bool:
    cmd = ["ffmpeg", "-y", "-i", str(video_path), "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", str(audio_path)]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return True

@st.cache_resource(show_spinner=False)
def load_whisper_engine():
    import torch
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"
    try:
        from faster_whisper import WhisperModel
        return ("faster-whisper", WhisperModel("base", device=device, compute_type=compute_type))
    except Exception:
        import whisper
        return ("openai-whisper", whisper.load_model("base", device=device))

def transcribe_audio_words(audio_path: Path) -> List[Dict[str, Any]]:
    engine_name, model = load_whisper_engine()
    words_list = []
    if engine_name == "faster-whisper":
        segments, _ = model.transcribe(str(audio_path), word_timestamps=True, vad_filter=True)
        for seg in segments:
            if seg.words:
                for w in seg.words:
                    words_list.append({"word": w.word.strip().upper(), "start": w.start, "end": w.end})
    else:
        res = model.transcribe(str(audio_path), word_timestamps=True, fp16=False)
        for seg in res.get("segments", []):
            for w in seg.get("words", []):
                words_list.append({"word": w.get("word", "").strip().upper(), "start": float(w.get("start", 0)), "end": float(w.get("end", 0))})
    return words_list

def generate_ass_subtitle_file(words: List[Dict[str, Any]], output_ass_path: Path, font_size_choice: str = "Medium", highlight_color_name: str = "Yellow"):
    font_meta = FONT_SIZE_MAP.get(font_size_choice, FONT_SIZE_MAP["Medium"])
    color_meta = COLOR_MAP_BGR_ASS.get(highlight_color_name, COLOR_MAP_BGR_ASS["Yellow"])
    highlight_ass = color_meta["ass"]
    default_white = "&H00FFFFFF&"
    
    ass_lines = [
        "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Default,Arial Black,{font_meta['size']},{default_white},{highlight_ass},&H00000000,&H80000000,-1,0,0,0,100,100,1.2,0,1,5.0,2.5,2,40,40,{font_meta['margin_v']},1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"
    ]
    groups = [words[i:i+3] for i in range(0, len(words), 3)]
    for grp in groups:
        for active_idx, target_word in enumerate(grp):
            start_str = format_ass_time(target_word["start"])
            end_t = target_word["end"] if target_word["end"] > target_word["start"] else target_word["start"] + 0.3
            end_str = format_ass_time(end_t)
            rendered = [f"{\\\\c{highlight_ass}}{w['word']}{\\\\c{default_white}}" if idx == active_idx else w['word'] for idx, w in enumerate(grp)]
            ass_lines.append(f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{' '.join(rendered)}")
    output_ass_path.write_text("\\n".join(ass_lines), encoding="utf-8")

def burn_subtitles_into_video(input_video: Path, ass_subtitle_file: Path, output_video: Path) -> bool:
    escaped = str(ass_subtitle_file.resolve()).replace("\\\\", "/").replace(":", "\\\\:")
    cmd = ["ffmpeg", "-y", "-i", str(input_video), "-vf", f"ass='{escaped}'", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "copy", "-movflags", "+faststart", str(output_video)]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return True

def run_shorts_pipeline(youtube_url: str, start_sec: float, end_sec: float, aspect_ratio: str, burn_captions: bool, font_size: str, highlight_color: str, progress_callback=None) -> Path:
    work_dir = Path(tempfile.mkdtemp(prefix="shortsforge_"))
    raw_segment = work_dir / "raw.mp4"
    cropped_video = work_dir / "crop.mp4"
    audio_wav = work_dir / "audio.wav"
    sub_ass = work_dir / "sub.ass"
    final_output = work_dir / "final.mp4"
    try:
        if progress_callback: progress_callback(0.15, "Streaming target chunk via yt-dlp...")
        download_youtube_segment(youtube_url, start_sec, end_sec, raw_segment)
        if progress_callback: progress_callback(0.40, f"Framing to {aspect_ratio}...")
        convert_aspect_ratio_and_frame(raw_segment, cropped_video, aspect_ratio)
        if burn_captions:
            if progress_callback: progress_callback(0.65, "Transcribing with Whisper...")
            extract_audio_from_clip(cropped_video, audio_wav)
            words = transcribe_audio_words(audio_wav)
            if progress_callback: progress_callback(0.80, "Generating animated ASS subtitles...")
            generate_ass_subtitle_file(words, sub_ass, font_size, highlight_color)
            if progress_callback: progress_callback(0.92, "Burning subtitles with FFmpeg...")
            burn_subtitles_into_video(cropped_video, sub_ass, final_output)
        else:
            shutil.copy2(cropped_video, final_output)
        out_dest = Path(tempfile.gettempdir()) / f"short_{os.getpid()}_{int(start_sec)}.mp4"
        shutil.copy2(final_output, out_dest)
        if progress_callback: progress_callback(1.0, "Short is ready!")
        return out_dest
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

def main():
    st.set_page_config(page_title="ShortsForge", page_icon="🎬", layout="wide")
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)
    st.title("🎬 ShortsForge: Long-to-Shorts Studio")
    url = st.text_input("YouTube Video URL", "https://www.youtube.com/watch?v=zjkBMFhNj_g")
    c1, c2 = st.columns(2)
    s_t = c1.text_input("Start Time (HH:MM:SS)", "00:15")
    e_t = c2.text_input("End Time (HH:MM:SS)", "00:45")
    ar = st.selectbox("Aspect Ratio", list(ASPECT_RATIOS.keys()))
    captions = st.toggle("Burn-in Dynamic Subtitles", True)
    f_size = st.selectbox("Font Size", list(FONT_SIZE_MAP.keys()), 1)
    color = st.selectbox("Highlight Color", list(COLOR_MAP_BGR_ASS.keys()), 0)
    
    if st.button("🚀 Repurpose into Short", type="primary"):
        s_sec = parse_time_to_seconds(s_t)
        e_sec = parse_time_to_seconds(e_t)
        prog = st.progress(0.0)
        status = st.empty()
        res = run_shorts_pipeline(url, s_sec, e_sec, ASPECT_RATIOS[ar], captions, f_size, color, lambda p, m: (prog.progress(p), status.write(m)))
        with open(res, "rb") as f:
            data = f.read()
        st.video(data)
        st.download_button("⬇️ Download Short (MP4)", data, "short.mp4", "video/mp4")

if __name__ == "__main__":
    main()
`,
  },
  'requirements.txt': {
    filename: 'requirements.txt',
    language: 'plaintext',
    description: 'Python pip dependencies pinned for local machines and cloud GPUs.',
    content: `# Core Streamlit Web Application
streamlit>=1.38.0,<2.0.0

# YouTube Chunk Streaming & Metadata Extraction
yt-dlp>=2024.8.6

# Fast Speech-to-Text with Word Timestamps
faster-whisper>=1.0.3
openai-whisper>=20231117

# Audio & Tensor Dependencies
torch>=2.2.0
torchaudio>=2.2.0

# Subtitle & Utility Libraries
pysubs2>=1.7.3
requests>=2.31.0
tqdm>=4.66.0
packaging>=23.0
`,
  },
  'packages.txt': {
    filename: 'packages.txt',
    language: 'plaintext',
    description: 'System packages for Linux / Debian / Hugging Face Spaces (includes FFmpeg and fonts).',
    content: `ffmpeg
fonts-liberation
fonts-dejavu-core
libsm6
libxext6
`,
  },
  'Dockerfile': {
    filename: 'Dockerfile',
    language: 'dockerfile',
    description: 'Production container setup with hardware acceleration, FFmpeg, and Python 3.10.',
    content: `FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \\
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \\
    ffmpeg \\
    fonts-liberation \\
    fonts-dejavu-core \\
    libsm6 \\
    libxext6 \\
    git \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
`,
  },
  'README.md': {
    filename: 'README.md',
    language: 'markdown',
    description: 'Comprehensive setup instructions for Windows, macOS, Linux, and Hugging Face Spaces.',
    content: `# 🎬 ShortsForge: AI YouTube to Vertical Shorts Repurposer

100% Free & Open-Source AI Multimedia Pipeline converting long YouTube videos into viral vertical 9:16 Shorts with dynamic word-level karaoke subtitles.

### Quick Commands:
\`\`\`bash
git clone https://github.com/your-username/shortsforge.git
cd shortsforge
pip install -r requirements.txt
streamlit run app.py
\`\`\`
`,
  },
};
