import unittest
import sys
from pathlib import Path

# Add project root to sys.path so core can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from core.media_engine import (
    is_valid_youtube_url,
    extract_youtube_video_id,
    parse_time_to_seconds,
    format_seconds_to_hms,
    format_ass_time,
)

class TestYouTubeHelpers(unittest.TestCase):
    def test_extract_youtube_video_id_valid_urls(self):
        cases = [
            ("https://www.youtube.com/watch?v=zjkBMFhNj_g", "zjkBMFhNj_g"),
            ("https://youtu.be/zjkBMFhNj_g", "zjkBMFhNj_g"),
            ("https://www.youtube.com/shorts/MVYrJJNdrEg", "MVYrJJNdrEg"),
            ("https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("zjkBMFhNj_g", "zjkBMFhNj_g"),
            ("https://m.youtube.com/watch?v=zjkBMFhNj_g&t=40s", "zjkBMFhNj_g"),
        ]
        for url, expected_id in cases:
            with self.subTest(url=url):
                self.assertEqual(extract_youtube_video_id(url), expected_id)

    def test_extract_youtube_video_id_invalid(self):
        invalid_cases = [
            "",
            "   ",
            "https://google.com/search?q=youtube",
            "https://notyoutube.com/watch?v=12345678901",
            "invalid_id_length",
        ]
        for url in invalid_cases:
            with self.subTest(url=url):
                self.assertIsNone(extract_youtube_video_id(url))

    def test_is_valid_youtube_url(self):
        self.assertTrue(is_valid_youtube_url("https://www.youtube.com/watch?v=zjkBMFhNj_g"))
        self.assertTrue(is_valid_youtube_url("https://youtu.be/zjkBMFhNj_g"))
        self.assertFalse(is_valid_youtube_url("not_a_url"))
        self.assertFalse(is_valid_youtube_url(""))

    def test_parse_time_to_seconds(self):
        self.assertEqual(parse_time_to_seconds("00:15"), 15.0)
        self.assertEqual(parse_time_to_seconds("01:30"), 90.0)
        self.assertEqual(parse_time_to_seconds("01:00:00"), 3600.0)
        self.assertEqual(parse_time_to_seconds("45"), 45.0)
        self.assertEqual(parse_time_to_seconds("12.5"), 12.5)
        self.assertIsNone(parse_time_to_seconds(""))
        self.assertIsNone(parse_time_to_seconds("invalid"))
        self.assertIsNone(parse_time_to_seconds("-15"))

    def test_format_seconds_to_hms(self):
        self.assertEqual(format_seconds_to_hms(0), "00:00:00")
        self.assertEqual(format_seconds_to_hms(45), "00:00:45")
        self.assertEqual(format_seconds_to_hms(90), "00:01:30")
        self.assertEqual(format_seconds_to_hms(3665), "01:01:05")

    def test_format_ass_time(self):
        self.assertEqual(format_ass_time(0.0), "0:00:00.00")
        self.assertEqual(format_ass_time(1.25), "0:00:01.25")
        self.assertEqual(format_ass_time(65.4), "0:01:05.40")

if __name__ == "__main__":
    unittest.main()
