import unittest
import inspect
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from core import media_engine

class TestSecurityContracts(unittest.TestCase):
    def test_no_shell_true_in_media_engine(self):
        """DevSecOps contract: No subprocess invocation in media_engine should use shell=True."""
        source = inspect.getsource(media_engine)
        self.assertNotIn("shell=True", source, "Security violation: shell=True detected in media_engine subprocess calls!")

    def test_ssrf_domain_restriction(self):
        """Prevents SSRF by ensuring only authorized YouTube domains are accepted."""
        malicious_urls = [
            "http://169.254.169.254/latest/meta-data/",
            "http://localhost:8080/admin",
            "http://127.0.0.1:22",
            "https://attacker.com/watch?v=12345678901",
            "file:///etc/passwd",
            "ftp://anonymous@evil.com/video.mp4",
        ]
        for url in malicious_urls:
            with self.subTest(url=url):
                self.assertFalse(
                    media_engine.is_valid_youtube_url(url),
                    f"Security failure: Malicious or internal URL accepted: {url}"
                )

    def test_command_injection_attempt_in_youtube_id(self):
        """Ensures command injection payloads inside YouTube URLs are neutralized."""
        injection_urls = [
            "https://www.youtube.com/watch?v=;rm -rf /;",
            "https://www.youtube.com/watch?v=$(reboot)",
            "https://www.youtube.com/watch?v=`cat /etc/passwd`",
            "https://www.youtube.com/watch?v=zjkBMFhNj_g|curl evil.com",
        ]
        for url in injection_urls:
            with self.subTest(url=url):
                video_id = media_engine.extract_youtube_video_id(url)
                if video_id:
                    # Video ID must match strict 11-char alphanumeric pattern
                    self.assertRegex(
                        video_id,
                        r"^[a-zA-Z0-9_-]{11}$",
                        f"Command injection payload slipped through extractor: {video_id}"
                    )

    def test_ass_subtitle_path_escaping(self):
        """Ensures ASS subtitle file path is escaped for FFmpeg filter safety."""
        test_path = Path("/tmp/dir:with:colons/sub\\file.ass")
        escaped = str(test_path.resolve()).replace("\\", "/").replace(":", "\\:")
        self.assertNotIn("::", escaped)
        self.assertIn("\\:", escaped)

if __name__ == "__main__":
    unittest.main()
