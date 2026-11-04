"""
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

# ==============================================================================
# UI THEMING & CUSTOM STYLES
# ==============================================================================
CUSTOM_CSS = """
<style>
/* Streamlit Dark Mode Enhancement */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* App Header styling */
.header-container {
    background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 30, 48, 0.95));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px 30px;
    margin-bottom: 25px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    backdrop-filter: blur(12px);
}

.brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: rgba(255, 75, 75, 0.15);
    border: 1px solid rgba(255, 75, 75, 0.3);
    border-radius: 20px;
    color: #ff4b4b;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
}

.app-title {
    font-size: 2.2rem;
    font-weight: 800;
    background: linear-gradient(90deg, #FFFFFF, #E2E8F0, #94A3B8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
    line-height: 1.2;
}

.app-subtitle {
    font-size: 0.98rem;
    color: #94A3B8;
    margin-top: 6px;
    margin-bottom: 0;
}

/* Card Container */
.card-box {
    background: rgba(25, 26, 36, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 18px;
}

.feature-pill {
    display: inline-block;
    padding: 2px 10px;
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    margin-right: 6px;
}

/* Video Preview Wrapper */
.video-preview-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #0b0c12;
    border-radius: 16px;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Status steps */
.step-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 6px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.step-item.active {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
}

.step-item.completed {
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.35);
}
</style>
"""

# ==============================================================================
# CONFIGURATION CONSTANTS
# ==============================================================================
MAX_CLIP_DURATION_SECONDS = 90.0  # Max YouTube Short length is typically 60-90 seconds
DEFAULT_RESOLUTION_WIDTH = 1080
DEFAULT_RESOLUTION_HEIGHT = 1920

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


# ==============================================================================
# UTILITY FUNCTIONS: TIME & VALIDATION
# ==============================================================================
def parse_time_to_seconds(time_str: str) -> Optional[float]:
    """
    Parses time strings into total float seconds.
    Supports formats:
      - 'HH:MM:SS' (e.g. '01:23:45')
      - 'MM:SS' (e.g. '02:15')
      - 'SS' or float (e.g. '75.5')
    """
    if time_str is None:
        return None

    cleaned = str(time_str).strip()
    if not cleaned:
        return None

    # Check for raw seconds (e.g., '45', '75.5')
    try:
        val = float(cleaned)
        return val if val >= 0 else None
    except ValueError:
        pass

    # Match time format parts
    parts = cleaned.split(":")
    try:
        if len(parts) == 3:  # HH:MM:SS
            h, m, s = float(parts[0]), float(parts[1]), float(parts[2])
            return h * 3600 + m * 60 + s
        elif len(parts) == 2:  # MM:SS
            m, s = float(parts[0]), float(parts[1])
            return m * 60 + s
    except (ValueError, TypeError):
        return None

    return None


def format_seconds_to_hms(seconds: float) -> str:
    """Formats float seconds into HH:MM:SS format."""
    total_sec = max(0.0, seconds)
    hours = int(total_sec // 3600)
    minutes = int((total_sec % 3600) // 60)
    secs = total_sec % 60
    return f"{hours:02d}:{minutes:02d}:{secs:05.2f}"


def format_ass_time(seconds: float) -> str:
    """
    Formats seconds into ASS timestamp format: H:MM:SS.cc (centiseconds)
    Example: 0:01:23.45
    """
    total_sec = max(0.0, seconds)
    hours = int(total_sec // 3600)
    rem = total_sec % 3600
    minutes = int(rem // 60)
    secs = int(rem % 60)
    cs = int(round((rem - int(rem)) * 100))
    if cs >= 100:
        cs = 99
    return f"{hours}:{minutes:02d}:{secs:02d}.{cs:02d}"


def is_valid_youtube_url(url: str) -> bool:
    """Validates whether a string is a recognized YouTube URL format."""
    if not url or not isinstance(url, str):
        return False
    youtube_regex = (
        r"^(https?://)?(www\.)?(youtube\.com/(watch\?v=|embed/|shorts/)|youtu\.be/)[\w\-]{11}(\S*)?$"
    )
    return bool(re.match(youtube_regex, url.strip()))


# ==============================================================================
# PIPELINE STEP A: SMART CHUNK DOWNLOADING (yt-dlp)
# ==============================================================================
def download_youtube_segment(
    url: str,
    start_sec: float,
    end_sec: float,
    output_path: Path,
) -> bool:
    """
    Downloads ONLY the requested segment from YouTube using yt-dlp's download_ranges
    callback. Avoids downloading the entire video.
    """
    try:
        from yt_dlp import YoutubeDL
    except ImportError:
        logger.error("yt-dlp is not installed. Please install via pip install yt-dlp.")
        raise RuntimeError("yt-dlp package is missing.")

    logger.info(
        f"Downloading YouTube segment [{start_sec}s -> {end_sec}s] to {output_path}..."
    )

    # yt-dlp download_ranges hook
    def download_range_hook(info_dict, ydl):
        return [
            {
                "start_time": start_sec,
                "end_time": end_sec,
            }
        ]

    # Configure yt-dlp options
    ydl_opts: Dict[str, Any] = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": str(output_path.with_suffix("")),  # yt-dlp appends .mp4
        "download_ranges": download_range_hook,
        "force_keyframes_at_cuts": True,
        "quiet": True,
        "no_warnings": True,
        "merge_output_format": "mp4",
        "postprocessors": [
            {
                "key": "FFmpegVideoRemuxer",
                "preferedformat": "mp4",
            }
        ],
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        # yt-dlp may output as output_path or output_path.mp4
        if not output_path.exists():
            candidate = output_path.with_suffix(".mp4")
            if candidate.exists():
                candidate.rename(output_path)

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError(
                "yt-dlp completed but output segment file was not generated or is empty."
            )

        logger.info(
            f"Segment downloaded successfully ({output_path.stat().st_size / 1024 / 1024:.2f} MB)"
        )
        return True

    except Exception as exc:
        logger.error(f"Failed to download YouTube chunk: {exc}", exc_info=True)
        raise RuntimeError(f"Error downloading YouTube segment: {str(exc)}") from exc


# ==============================================================================
# PIPELINE STEP B: ASPECT RATIO CONVERSION & FRAMING (FFmpeg)
# ==============================================================================
def convert_aspect_ratio_and_frame(
    input_video: Path,
    output_video: Path,
    aspect_ratio: str,
) -> bool:
    """
    Converts video framing via FFmpeg center-crop & scaling:
      - 9:16 (Vertical Short - 1080x1920): crop=ih*(9/16):ih, scale=1080:1920
      - 1:1  (Square - 1080x1080): crop=ih:ih, scale=1080:1080
      - 16:9 (Horizontal): keep original, scale to 1920:1080 if needed
    """
    logger.info(
        f"Processing video framing: mode={aspect_ratio}, input={input_video} -> {output_video}"
    )

    if aspect_ratio == "9:16":
        # Dynamic center crop 9:16 and scale to standard 1080x1920
        vf_filter = "crop=ih*(9/16):ih,scale=1080:1920:flags=lanczos"
    elif aspect_ratio == "1:1":
        # Dynamic center crop 1:1 and scale to standard 1080x1080
        vf_filter = "crop=ih:ih,scale=1080:1080:flags=lanczos"
    else:
        # 16:9 or horizontal: ensure even dimensions and scale
        vf_filter = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_video),
        "-vf",
        vf_filter,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "44100",
        "-movflags",
        "+faststart",
        str(output_video),
    ]

    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        logger.info("Aspect ratio conversion completed successfully.")
        return True
    except subprocess.CalledProcessError as exc:
        logger.error(f"FFmpeg crop failed: {exc.stderr}")
        raise RuntimeError(f"FFmpeg cropping error: {exc.stderr}") from exc


def extract_audio_from_clip(video_path: Path, audio_path: Path) -> bool:
    """Extracts 16kHz mono WAV audio from the video clip for optimal Whisper transcription."""
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(audio_path),
    ]
    try:
        subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        return True
    except subprocess.CalledProcessError as exc:
        logger.error(f"FFmpeg audio extraction failed: {exc.stderr}")
        raise RuntimeError(f"FFmpeg audio extraction error: {exc.stderr}") from exc


# ==============================================================================
# PIPELINE STEP C: SPEECH RECOGNITION & SUBTITLES (Whisper + ASS)
# ==============================================================================
@st.cache_resource(show_spinner=False)
def load_whisper_engine():
    """
    Loads faster-whisper or standard openai-whisper with device auto-detection.
    Cached across user runs to prevent reloading overhead.
    """
    import torch

    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"

    logger.info(
        f"Initializing Whisper engine on device={device}, compute_type={compute_type}..."
    )

    try:
        from faster_whisper import WhisperModel

        model = WhisperModel("base", device=device, compute_type=compute_type)
        logger.info("Loaded faster-whisper (base model) successfully.")
        return ("faster-whisper", model)
    except Exception as e_fast:
        logger.warning(
            f"faster-whisper failed to initialize ({e_fast}). Attempting openai-whisper..."
        )
        try:
            import whisper

            model = whisper.load_model("base", device=device)
            logger.info("Loaded openai-whisper (base model) fallback.")
            return ("openai-whisper", model)
        except Exception as e_std:
            logger.error(f"All Whisper engines failed to initialize: {e_std}")
            raise RuntimeError(
                "Whisper speech recognition engine could not be initialized."
            )


def transcribe_audio_words(audio_path: Path) -> List[Dict[str, Any]]:
    """
    Transcribes audio and returns a list of word dictionaries:
    [{'word': 'HELLO', 'start': 0.12, 'end': 0.45}, ...]
    """
    engine_name, model = load_whisper_engine()
    words_list: List[Dict[str, Any]] = []

    if engine_name == "faster-whisper":
        segments, _ = model.transcribe(
            str(audio_path),
            word_timestamps=True,
            language=None,  # Auto-detect language
            vad_filter=True,
        )
        for segment in segments:
            if segment.words:
                for w in segment.words:
                    clean_w = w.word.strip().upper()
                    if clean_w:
                        words_list.append(
                            {
                                "word": clean_w,
                                "start": w.start,
                                "end": w.end,
                            }
                        )
            else:
                # Fallback if no word tokens in segment
                clean_text = segment.text.strip().upper()
                if clean_text:
                    words_list.append(
                        {
                            "word": clean_text,
                            "start": segment.start,
                            "end": segment.end,
                        }
                    )
    else:
        # openai-whisper with word timestamps
        result = model.transcribe(
            str(audio_path),
            word_timestamps=True,
            fp16=False,
        )
        for seg in result.get("segments", []):
            if "words" in seg and seg["words"]:
                for w in seg["words"]:
                    clean_w = w.get("word", "").strip().upper()
                    if clean_w:
                        words_list.append(
                            {
                                "word": clean_w,
                                "start": float(w.get("start", 0.0)),
                                "end": float(w.get("end", 0.0)),
                            }
                        )
            else:
                clean_text = seg.get("text", "").strip().upper()
                if clean_text:
                    words_list.append(
                        {
                            "word": clean_text,
                            "start": float(seg.get("start", 0.0)),
                            "end": float(seg.get("end", 0.0)),
                        }
                    )

    return words_list


def generate_ass_subtitle_file(
    words: List[Dict[str, Any]],
    output_ass_path: Path,
    font_size_choice: str = "Medium",
    highlight_color_name: str = "Yellow",
    words_per_group: int = 3,
) -> None:
    """
    Generates an Advanced SubStation Alpha (.ass) subtitle file formatted for
    high-retention Shorts / Reels.
      - Bottom-center aligned (Alignment 2)
      - Bold uppercase sans-serif font
      - High-contrast border/outline and drop shadow
      - Active word highlight color with ASS karaoke or inline override tags
    """
    font_meta = FONT_SIZE_MAP.get(font_size_choice, FONT_SIZE_MAP["Medium"])
    font_size = font_meta["size"]
    margin_v = font_meta["margin_v"]

    color_meta = COLOR_MAP_BGR_ASS.get(
        highlight_color_name, COLOR_MAP_BGR_ASS["Yellow"]
    )
    highlight_ass = color_meta["ass"]
    default_white_ass = "&H00FFFFFF&"

    # ASS Header
    ass_lines = [
        "[Script Info]",
        "ScriptType: v4.00+",
        "PlayResX: 1080",
        "PlayResY: 1920",
        "ScaledBorderAndShadow: yes",
        "YCbCr Matrix: TV.709",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Default,Arial Black,{font_size},{default_white_ass},{highlight_ass},&H00000000,&H80000000,-1,0,0,0,100,100,1.2,0,1,5.0,2.5,2,40,40,{margin_v},1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]

    if not words:
        # Write empty ASS if no speech detected
        output_ass_path.write_text("\n".join(ass_lines), encoding="utf-8")
        return

    # Group words into short, fast-paced phrases (default 3-4 words per screen)
    groups: List[List[Dict[str, Any]]] = []
    for i in range(0, len(words), words_per_group):
        groups.append(words[i : i + words_per_group])

    # For each group, create animated events where the active spoken word is highlighted
    for grp in groups:
        if not grp:
            continue

        for active_idx, target_word in enumerate(grp):
            start_t = target_word["start"]
            end_t = target_word["end"]

            # Ensure minimum legible duration
            if end_t <= start_t:
                end_t = start_t + 0.25

            # If there's a gap before next word, stretch slightly
            if active_idx + 1 < len(grp):
                next_start = grp[active_idx + 1]["start"]
                if next_start > end_t and (next_start - end_t) < 0.2:
                    end_t = next_start

            start_str = format_ass_time(start_t)
            end_str = format_ass_time(end_t)

            # Build line text: active word highlighted in highlight_ass, others in white
            rendered_words = []
            for idx, w_dict in enumerate(grp):
                w_text = w_dict["word"]
                if idx == active_idx:
                    # Highlighted active word
                    rendered_words.append(f"{{\\c{highlight_ass}}}{w_text}{{\\c{default_white_ass}}}")
                else:
                    rendered_words.append(w_text)

            line_text = " ".join(rendered_words)
            dialogue_entry = f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{line_text}"
            ass_lines.append(dialogue_entry)

    output_ass_path.write_text("\n".join(ass_lines), encoding="utf-8")
    logger.info(f"Generated dynamic ASS subtitles with {len(words)} words.")


# ==============================================================================
# PIPELINE STEP D: SUBTITLE HARDCODING (FFmpeg)
# ==============================================================================
def burn_subtitles_into_video(
    input_video: Path,
    ass_subtitle_file: Path,
    output_video: Path,
) -> bool:
    """
    Burns the generated ASS subtitles directly into the video stream with zero audio drift.
    Properly escapes file paths for Linux, macOS, and Windows.
    """
    logger.info(f"Burning subtitles from {ass_subtitle_file} into {output_video}...")

    # Cross-platform ASS filter path escaping for FFmpeg
    escaped_ass_path = (
        str(ass_subtitle_file.resolve())
        .replace("\\", "/")
        .replace(":", "\\:")
        .replace("[", "\\[")
        .replace("]", "\\]")
        .replace("'", "\\'")
    )

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_video),
        "-vf",
        f"ass='{escaped_ass_path}'",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "20",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        str(output_video),
    ]

    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        logger.info("Subtitles burned successfully.")
        return True
    except subprocess.CalledProcessError as exc:
        logger.warning(
            f"ASS filter failed, falling back to subtitles filter: {exc.stderr}"
        )
        # Fallback to standard subtitles filter
        fallback_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(input_video),
            "-vf",
            f"subtitles='{escaped_ass_path}'",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-c:a",
            "copy",
            "-movflags",
            "+faststart",
            str(output_video),
        ]
        proc_fallback = subprocess.run(
            fallback_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
        return True


# ==============================================================================
# MAIN ORCHESTRATOR PIPELINE
# ==============================================================================
def run_shorts_pipeline(
    youtube_url: str,
    start_sec: float,
    end_sec: float,
    aspect_ratio: str,
    burn_captions: bool,
    font_size: str,
    highlight_color: str,
    progress_callback=None,
) -> Path:
    """
    Executes the complete pipeline:
      1. Smart Chunk Downloading
      2. Aspect Ratio Conversion & Framing
      3. Whisper Speech Recognition & ASS Subtitles
      4. Subtitle Hardcoding
      5. Safe cleanup of temporary assets
    """
    duration = end_sec - start_sec
    if duration <= 0:
        raise ValueError("End Time must be strictly greater than Start Time.")
    if duration > MAX_CLIP_DURATION_SECONDS:
        raise ValueError(
            f"Clip duration ({duration:.1f}s) exceeds maximum allowed length of {MAX_CLIP_DURATION_SECONDS}s."
        )

    # Create isolated temporary workspace
    work_dir = Path(tempfile.mkdtemp(prefix="shortsforge_"))
    logger.info(f"Created temporary workspace at {work_dir}")

    raw_segment = work_dir / "raw_segment.mp4"
    cropped_video = work_dir / "cropped_framed.mp4"
    extracted_audio = work_dir / "audio.wav"
    subtitles_ass = work_dir / "captions.ass"
    final_output = work_dir / "final_short.mp4"

    try:
        # Step 1: Downloading chunk
        if progress_callback:
            progress_callback(
                0.15, "Step 1/5: Streaming & downloading video chunk via yt-dlp..."
            )
        download_youtube_segment(youtube_url, start_sec, end_sec, raw_segment)

        # Step 2: Framing and Cropping
        if progress_callback:
            progress_callback(
                0.40,
                f"Step 2/5: Framing video to {aspect_ratio} and encoding via FFmpeg...",
            )
        convert_aspect_ratio_and_frame(raw_segment, cropped_video, aspect_ratio)

        # Step 3 & 4: Subtitles (if enabled)
        if burn_captions:
            if progress_callback:
                progress_callback(
                    0.65,
                    "Step 3/5: Transcribing speech with Whisper (word timestamps)...",
                )
            extract_audio_from_clip(cropped_video, extracted_audio)
            words = transcribe_audio_words(extracted_audio)

            if progress_callback:
                progress_callback(
                    0.80,
                    f"Step 4/5: Generating dynamic ASS subtitles with {highlight_color} highlight...",
                )
            generate_ass_subtitle_file(
                words=words,
                output_ass_path=subtitles_ass,
                font_size_choice=font_size,
                highlight_color_name=highlight_color,
            )

            if progress_callback:
                progress_callback(
                    0.92,
                    "Step 5/5: Hardcoding synchronized subtitles into video stream...",
                )
            burn_subtitles_into_video(cropped_video, subtitles_ass, final_output)
        else:
            # Captions bypassed
            if progress_callback:
                progress_callback(0.90, "Skipping captions as requested...")
            shutil.copy2(cropped_video, final_output)

        if progress_callback:
            progress_callback(1.0, "Ready! Your vertical Short is compiled.")

        # Read output into persistent temp file or cache so workspace can be pruned
        permanent_short = Path(tempfile.gettempdir()) / f"short_{os.getpid()}_{int(start_sec)}_{int(end_sec)}.mp4"
        shutil.copy2(final_output, permanent_short)
        return permanent_short

    finally:
        # Always clean up heavy intermediate files to prevent disk bloat
        try:
            shutil.rmtree(work_dir, ignore_errors=True)
            logger.info(f"Cleaned up temporary workspace: {work_dir}")
        except Exception as e_clean:
            logger.warning(f"Could not remove temp workspace {work_dir}: {e_clean}")


# ==============================================================================
# STREAMLIT USER INTERFACE
# ==============================================================================
def main():
    st.set_page_config(
        page_title="ShortsForge - YouTube to Shorts Repurposer",
        page_icon="🎬",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # Inject custom styling
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

    # Header Card
    st.markdown(
        """
        <div class="header-container">
            <div class="brand-badge">⚡ 100% Free & Open-Source AI Multimedia Pipeline</div>
            <h1 class="app-title">ShortsForge: Long-to-Shorts Studio</h1>
            <p class="app-subtitle">
                Repurpose long-form YouTube videos into vertical 9:16 Shorts with smart range streaming, dynamic center-framing, and word-level Whisper karaoke subtitles.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Sidebar: Information & Quick Presets
    with st.sidebar:
        st.subheader("⚙️ System Architecture")
        st.markdown(
            """
            - **Downloader:** `yt-dlp` (*Smart range streaming*)
            - **Cropping & Scaling:** `FFmpeg` (*Dynamic 9:16 center-crop*)
            - **AI Transcription:** `faster-whisper` / `whisper`
            - **Subtitles:** Advanced SubStation Alpha (`.ass`)
            - **Cost:** **$0.00** *(No OpenAI or paid APIs needed)*
            """
        )

        st.divider()
        st.subheader("💡 High-Retention Presets")
        preset_choice = st.selectbox(
            "Load Demo YouTube Preset:",
            [
                "Custom URL",
                "Andrej Karpathy - Intro to LLMs (AI Talk)",
                "Lex Fridman Podcast - Mark Zuckerberg",
                "Veritasium - The Science of Focus",
            ],
        )

        st.divider()
        st.caption("Deployment Target: Local or Hugging Face Spaces (CPU/T4)")

    # Preset URL mapping
    demo_urls = {
        "Andrej Karpathy - Intro to LLMs (AI Talk)": (
            "https://www.youtube.com/watch?v=zjkBMFhNj_g",
            "00:15",
            "00:45",
        ),
        "Lex Fridman Podcast - Mark Zuckerberg": (
            "https://www.youtube.com/watch?v=MVYrJJNdrEg",
            "01:10",
            "01:40",
        ),
        "Veritasium - The Science of Focus": (
            "https://www.youtube.com/watch?v=U36_8p1r2_E",
            "00:30",
            "01:00",
        ),
    }

    default_url = "https://www.youtube.com/watch?v=zjkBMFhNj_g"
    default_start = "00:15"
    default_end = "00:45"

    if preset_choice in demo_urls:
        default_url, default_start, default_end = demo_urls[preset_choice]

    # Two column layout: Configuration on left, Processing & Preview on right
    col_input, col_preview = st.columns([1.1, 0.9], gap="large")

    with col_input:
        st.markdown("### 1. Source Video & Timestamps")

        youtube_url = st.text_input(
            "YouTube Video URL:",
            value=default_url,
            placeholder="https://www.youtube.com/watch?v=...",
            help="Supports standard YouTube URLs, youtu.be links, and shorts URLs.",
        )

        col_t1, col_t2 = st.columns(2)
        with col_t1:
            start_time_input = st.text_input(
                "Start Time (HH:MM:SS or SS):",
                value=default_start,
                help="Accepts '01:23:45', '02:15', or raw seconds '75'",
            )
        with col_t2:
            end_time_input = st.text_input(
                "End Time (HH:MM:SS or SS):",
                value=default_end,
                help="Max duration: 90 seconds. Accepts '02:45' or raw seconds.",
            )

        # Parse & Validate timestamps
        start_sec = parse_time_to_seconds(start_time_input)
        end_sec = parse_time_to_seconds(end_time_input)

        if start_sec is not None and end_sec is not None:
            clip_len = end_sec - start_sec
            if clip_len <= 0:
                st.error("⚠️ End Time must be greater than Start Time!")
            elif clip_len > MAX_CLIP_DURATION_SECONDS:
                st.error(
                    f"⚠️ Clip length is {clip_len:.1f}s. Max allowed length is {MAX_CLIP_DURATION_SECONDS}s."
                )
            else:
                st.info(
                    f"⏱️ Selected Segment: **{format_seconds_to_hms(start_sec)}** ➔ **{format_seconds_to_hms(end_sec)}** (Total: **{clip_len:.1f} seconds**)"
                )
        else:
            st.warning("Please enter valid time strings (e.g., '00:30' or '45').")

        st.markdown("### 2. Framing & Aspect Ratio")
        aspect_ratio_label = st.selectbox(
            "Output Aspect Ratio:",
            list(ASPECT_RATIOS.keys()),
            index=0,
            help="9:16 dynamically crops the center of the frame and scales to 1080x1920.",
        )
        aspect_ratio_code = ASPECT_RATIOS[aspect_ratio_label]

        st.markdown("### 3. Dynamic Caption Styling")
        burn_captions = st.toggle("Burn-in Dynamic Subtitles", value=True)

        if burn_captions:
            cap_col1, cap_col2 = st.columns(2)
            with cap_col1:
                font_size_choice = st.selectbox(
                    "Font Size:",
                    list(FONT_SIZE_MAP.keys()),
                    index=1,  # Medium
                )
            with cap_col2:
                highlight_color_name = st.selectbox(
                    "Active Word Highlight Color:",
                    list(COLOR_MAP_BGR_ASS.keys()),
                    index=0,  # Yellow
                )

            st.caption(
                f"🎨 Subtitles styled with bold uppercase text, black border outline, and **{highlight_color_name}** word-level karaoke animation."
            )
        else:
            font_size_choice = "Medium"
            highlight_color_name = "Yellow"

        st.markdown("---")
        generate_btn = st.button(
            "🚀 Repurpose into Short",
            type="primary",
            use_container_width=True,
            disabled=(
                start_sec is None
                or end_sec is None
                or (end_sec - start_sec) <= 0
                or (end_sec - start_sec) > MAX_CLIP_DURATION_SECONDS
            ),
        )

    # Right Column: Output & Status
    with col_preview:
        st.markdown("### 🎬 Generated Short Preview")

        if generate_btn:
            if not is_valid_youtube_url(youtube_url):
                st.error(
                    "❌ Invalid YouTube URL format. Please provide a valid YouTube watch link."
                )
                return

            # Visual progress indicators
            progress_bar = st.progress(0.0)
            status_text = st.empty()

            def update_progress(pct: float, message: str):
                progress_bar.progress(pct)
                status_text.markdown(f"**{message}**")

            try:
                with st.spinner("Processing video pipeline..."):
                    result_path = run_shorts_pipeline(
                        youtube_url=youtube_url.strip(),
                        start_sec=start_sec,
                        end_sec=end_sec,
                        aspect_ratio=aspect_ratio_code,
                        burn_captions=burn_captions,
                        font_size=font_size_choice,
                        highlight_color=highlight_color_name,
                        progress_callback=update_progress,
                    )

                status_text.success("🎉 Short generated successfully!")

                # Render video player
                with open(result_path, "rb") as vid_file:
                    video_bytes = vid_file.read()

                st.video(video_bytes)

                # Download button
                st.download_button(
                    label="⬇️ Download Short (MP4)",
                    data=video_bytes,
                    file_name="youtube_short.mp4",
                    mime="video/mp4",
                    type="primary",
                    use_container_width=True,
                )

            except Exception as e:
                status_text.error(f"❌ Processing failed: {str(e)}")
                st.exception(e)
        else:
            st.info(
                "👈 Configure your clip settings on the left and click **'Repurpose into Short'** to start the pipeline."
            )
            st.markdown(
                """
                <div class="video-preview-wrapper" style="min-height: 400px; color: #64748b; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📱</div>
                    <div style="font-size: 16px; font-weight: 600; color: #94a3b8;">Short Preview Area</div>
                    <div style="font-size: 13px; max-width: 280px; margin-top: 6px;">
                        The cropped 9:16 vertical video with burned-in karaoke captions will render here.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


if __name__ == "__main__":
    main()
