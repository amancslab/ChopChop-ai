import unittest
import tempfile
import subprocess
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from core.media_engine import (
    convert_aspect_ratio_and_frame,
    extract_audio_from_clip,
    generate_ass_subtitle_file,
    burn_subtitles_into_video,
)

def ffprobe_video_metadata(file_path: Path):
    """Inspects video stream metadata using ffprobe with json format."""
    import json
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,codec_name,duration",
        "-of",
        "json",
        str(file_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(res.stdout)
    stream = data["streams"][0]
    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "codec": stream.get("codec_name"),
        "duration": float(stream["duration"]) if "duration" in stream else None,
    }

def ffprobe_has_audio(file_path: Path) -> bool:
    """Checks if an audio stream exists."""
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_name",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(file_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return bool(res.stdout.strip())

class TestFFmpegMediaPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Verify ffmpeg and ffprobe exist on system
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            raise unittest.SkipTest("FFmpeg/FFprobe binaries not found on system.")

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(prefix="chopchop_media_test_")
        self.work_dir = Path(self.temp_dir.name)
        self.synthetic_source = self.work_dir / "synthetic_16x9.mp4"

        # Generate a lightweight 2-second 1280x720 16:9 test video with a 1000Hz sine audio stream
        cmd = [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "testsrc=duration=2:size=1280x720:rate=30",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=1000:duration=2",
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            str(self.synthetic_source),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_convert_aspect_ratio_916_vertical(self):
        output_crop = self.work_dir / "output_916.mp4"
        success = convert_aspect_ratio_and_frame(self.synthetic_source, output_crop, "9:16")
        self.assertTrue(success)
        self.assertTrue(output_crop.exists())
        self.assertGreater(output_crop.stat().st_size, 1000)

        meta = ffprobe_video_metadata(output_crop)
        self.assertEqual(meta["width"], 1080)
        self.assertEqual(meta["height"], 1920)
        self.assertEqual(meta["codec"], "h264")
        self.assertTrue(ffprobe_has_audio(output_crop))

    def test_convert_aspect_ratio_11_square(self):
        output_square = self.work_dir / "output_11.mp4"
        success = convert_aspect_ratio_and_frame(self.synthetic_source, output_square, "1:1")
        self.assertTrue(success)

        meta = ffprobe_video_metadata(output_square)
        self.assertEqual(meta["width"], 1080)
        self.assertEqual(meta["height"], 1080)
        self.assertTrue(ffprobe_has_audio(output_square))

    def test_extract_audio_from_clip(self):
        output_wav = self.work_dir / "extracted.wav"
        success = extract_audio_from_clip(self.synthetic_source, output_wav)
        self.assertTrue(success)
        self.assertTrue(output_wav.exists())
        self.assertGreater(output_wav.stat().st_size, 500)

    def test_burn_subtitles_into_video(self):
        # 1. First convert to 9:16
        cropped = self.work_dir / "cropped.mp4"
        convert_aspect_ratio_and_frame(self.synthetic_source, cropped, "9:16")

        # 2. Generate ASS subtitle
        ass_path = self.work_dir / "sub.ass"
        words = [
            {"word": "CHOP", "start": 0.1, "end": 0.8},
            {"word": "CHOP", "start": 0.8, "end": 1.5},
        ]
        generate_ass_subtitle_file(words, ass_path, font_size="Medium", highlight_color="Yellow")

        # 3. Burn into video
        final_mp4 = self.work_dir / "final_short.mp4"
        success = burn_subtitles_into_video(cropped, ass_path, final_mp4)
        self.assertTrue(success)
        self.assertTrue(final_mp4.exists())
        self.assertGreater(final_mp4.stat().st_size, 1000)

        # Validate with ffprobe
        meta = ffprobe_video_metadata(final_mp4)
        self.assertEqual(meta["width"], 1080)
        self.assertEqual(meta["height"], 1920)
        self.assertTrue(ffprobe_has_audio(final_mp4))

if __name__ == "__main__":
    unittest.main()
