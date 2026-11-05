import unittest
import tempfile
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from core.media_engine import generate_ass_subtitle_file, COLOR_MAP_BGR_ASS, FONT_SIZE_MAP

class TestAssGeneration(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.ass_file = Path(self.temp_dir.name) / "output.ass"

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_generate_ass_empty_words(self):
        generate_ass_subtitle_file([], self.ass_file)
        self.assertTrue(self.ass_file.exists())
        content = self.ass_file.read_text(encoding="utf-8")
        self.assertIn("[Script Info]", content)
        self.assertIn("PlayResX: 1080", content)
        self.assertIn("PlayResY: 1920", content)
        self.assertIn("[Events]", content)

    def test_generate_ass_with_karaoke_dialogues(self):
        words = [
            {"word": "TURN", "start": 0.1, "end": 0.5},
            {"word": "FAT", "start": 0.5, "end": 0.9},
            {"word": "VIDEOS", "start": 0.9, "end": 1.4},
        ]
        generate_ass_subtitle_file(words, self.ass_file, font_size="Medium", highlight_color="Yellow")
        content = self.ass_file.read_text(encoding="utf-8")
        # Check that highlight color is applied
        yellow_bgr = COLOR_MAP_BGR_ASS["Yellow"]
        self.assertIn(f"{{\\c{yellow_bgr}}}TURN{{\\c&H00FFFFFF&}} FAT VIDEOS", content)
        self.assertIn(f"TURN {{\\c{yellow_bgr}}}FAT{{\\c&H00FFFFFF&}} VIDEOS", content)
        self.assertIn(f"TURN FAT {{\\c{yellow_bgr}}}VIDEOS{{\\c&H00FFFFFF&}}", content)

    def test_generate_ass_font_sizes(self):
        words = [{"word": "TEST", "start": 0.0, "end": 1.0}]
        for size_name, pt in FONT_SIZE_MAP.items():
            out = Path(self.temp_dir.name) / f"{size_name}.ass"
            generate_ass_subtitle_file(words, out, font_size=size_name)
            content = out.read_text(encoding="utf-8")
            self.assertIn(f"DejaVu Sans,{pt},", content)

if __name__ == "__main__":
    unittest.main()
