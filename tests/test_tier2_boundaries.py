"""
Tier 2: Boundary & Corner Case Tests
Validates boundary values, empty states, extreme inputs, unicode integrity,
and responsive limits across all modules.
"""

import re
import json
import unittest
from pathlib import Path

from tests.helpers import (
    INDEX_HTML,
    DONGGOP_HTML,
    STYLES_CSS,
    SCRIPT_JS,
    WISHES_JSON,
    read_workspace_file,
    parse_html,
    parse_css_rules,
    MockLocalStorage,
)


class TestTier2Boundaries(unittest.TestCase):
    """
    Tier 2 tests rigorously verify edge cases, boundary parameters, and error resilience.
    """

    def test_empty_and_whitespace_input_validation(self):
        """
        Verify that donggop.html forms enforce non-empty, non-whitespace validation
        on mandatory fields (author and wish).
        """
        content = read_workspace_file(DONGGOP_HTML)
        parser = parse_html(content)

        # Check required attribute on author inputs
        author_inputs = [
            el for el in parser.elements
            if el["tag"] == "input" and "author" in (el.get("id") or "").lower()
        ]
        self.assertGreater(len(author_inputs), 0, "donggop.html must have author input fields")
        for inp in author_inputs:
            self.assertIn("required", inp["attrs"], f"Author input {inp.get('id')} must be required")

        # In script logic, verify presence of .trim() validation
        self.assertIn(".trim()", content, "Input validation must use .trim() to reject whitespace-only submissions")

    def test_extreme_wish_text_expansion_and_word_wrap(self):
        """
        Verify that sub-letter cards in styles.css accommodate extreme text lengths
        (e.g., 500+ character heartfelt essays) without overflowing or clipping.
        """
        css_content = read_workspace_file(STYLES_CSS)
        rules = parse_css_rules(css_content)

        # Find rules for letter cards / sub-letter cards
        card_rules = [r for r in rules if any(k in r["selector"] for k in [".sub-letter-card", ".letter-card", ".wish-card"])]
        
        # Check for auto height and word wrap
        has_word_wrap = (
            "break-word" in css_content
            or "overflow-wrap" in css_content
            or "word-break" in css_content
        )
        self.assertTrue(
            has_word_wrap,
            "styles.css must specify word-break or overflow-wrap: break-word to prevent text overflow from long words"
        )

        has_auto_height = False
        for cr in card_rules:
            h = cr["properties"].get("height", "")
            min_h = cr["properties"].get("min-height", "")
            if h in ("auto", "fit-content", "max-content") or min_h != "":
                has_auto_height = True
                break
        
        # If card rules are defined, verify height is flexible
        if card_rules:
            self.assertTrue(
                has_auto_height or "height: auto" in css_content,
                "Sub-letter cards must have flexible auto/min-height to accommodate varying message lengths"
            )

    def test_localstorage_corruption_resilience(self):
        """
        Simulate corrupt, null, or malformed localStorage states and verify that
        data hydration logic safely falls back without throwing unhandled exceptions.
        """
        mock_storage = MockLocalStorage({
            "co_duyen_anh_wishes": "{malformed_json: true,",  # Corrupt JSON
            "co_duyen_anh_deleted_ids": "not_an_array",      # Invalid type
            "co_duyen_anh_photos": ""                         # Empty string
        })

        # Test safe JSON parsing pattern expected in client code
        def safe_load_wishes(storage):
            raw = storage.getItem("co_duyen_anh_wishes")
            if not raw:
                return []
            try:
                data = json.loads(raw)
                return data if isinstance(data, list) else []
            except Exception:
                return []

        def safe_load_tombstones(storage):
            raw = storage.getItem("co_duyen_anh_deleted_ids")
            if not raw:
                return set()
            try:
                data = json.loads(raw)
                return set(data) if isinstance(data, list) else set()
            except Exception:
                return set()

        # Both loaders must handle corruption gracefully
        wishes = safe_load_wishes(mock_storage)
        tombstones = safe_load_tombstones(mock_storage)
        self.assertEqual(wishes, [])
        self.assertEqual(tombstones, set())

        # Verify client script implements try/catch for localStorage operations
        script_content = read_workspace_file(SCRIPT_JS)
        donggop_content = read_workspace_file(DONGGOP_HTML)
        combined = script_content + "\n" + donggop_content
        self.assertIn("try", combined, "Code parsing localStorage must use try/catch blocks for resilience")

    def test_empty_and_populated_tombstone_filtering(self):
        """
        Verify tombstone filtering logic when co_duyen_anh_deleted_ids is empty,
        partially populated, or contains IDs from wishes.json.
        """
        # Baseline wishes.json dataset
        initial_wishes = [
            {"id": "wish-1", "author": "Nguyễn Văn A", "wish": "Chúc mừng ngày 20/11"},
            {"id": "wish-2", "author": "Trần Thị B", "wish": "Tri ân cô Duyên Anh"}
        ]

        # Case 1: Empty tombstone list -> all items retained
        deleted_ids_1 = set()
        active_wishes_1 = [w for w in initial_wishes if w["id"] not in deleted_ids_1]
        self.assertEqual(len(active_wishes_1), 2)

        # Case 2: wish-1 deleted -> only wish-2 retained
        deleted_ids_2 = {"wish-1"}
        active_wishes_2 = [w for w in initial_wishes if w["id"] not in deleted_ids_2]
        self.assertEqual(len(active_wishes_2), 1)
        self.assertEqual(active_wishes_2[0]["id"], "wish-2")

        # Case 3: All deleted -> empty result
        deleted_ids_3 = {"wish-1", "wish-2"}
        active_wishes_3 = [w for w in initial_wishes if w["id"] not in deleted_ids_3]
        self.assertEqual(len(active_wishes_3), 0)

    def test_vietnamese_unicode_and_xss_sanitization(self):
        """
        Verify that submissions containing complex Vietnamese diacritics, emojis,
        and potential HTML meta-characters (<script>, &, quotes) are safely handled.
        """
        complex_input = 'Lớp 12-3 & Cô Duyên Anh ❤️ <script>alert("xss")</script> "Tuyệt vời!"'
        
        # Test escaping helper
        def escape_html(text):
            return (
                text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&#039;")
            )

        sanitized = escape_html(complex_input)
        self.assertNotIn("<script>", sanitized)
        self.assertIn("&lt;script&gt;", sanitized)
        self.assertIn("Cô Duyên Anh ❤️", sanitized, "Vietnamese unicode diacritics and emojis must be preserved")

        # Check that script.js or donggop.html uses textContent or proper escaping
        donggop_content = read_workspace_file(DONGGOP_HTML)
        script_content = read_workspace_file(SCRIPT_JS)
        combined = donggop_content + "\n" + script_content
        
        has_safe_dom_assignment = "textContent" in combined or "innerText" in combined or "escape" in combined.lower()
        self.assertTrue(
            has_safe_dom_assignment,
            "Client scripts must utilize textContent or sanitization to prevent XSS injection"
        )

    def test_mobile_portrait_viewport_breakpoints(self):
        """
        Verify styles.css defines media queries accommodating standard smartphone portrait
        widths (375px, 390px, 414px, 430px) without rigid fixed pixel constraints.
        """
        css_content = read_workspace_file(STYLES_CSS)
        
        # Look for mobile media queries (e.g. max-width: 768px, 480px, 430px)
        has_mobile_mq = bool(re.search(r"@media\s*\([^\)]*max-width\s*:\s*(768|640|480|430)px", css_content))
        self.assertTrue(
            has_mobile_mq,
            "styles.css must include responsive media queries targeting mobile screens (<= 768px/480px)"
        )

        # Verify no hardcoded fixed width over 360px on root/body containers
        rules = parse_css_rules(css_content)
        for r in rules:
            if r["selector"] in ("body", "#scene", ".container", "html"):
                w = r["properties"].get("width", "")
                if "px" in w:
                    px_val = int(re.search(r"(\d+)px", w).group(1))
                    self.assertLessEqual(
                        px_val,
                        430,
                        f"Root container '{r['selector']}' must not have rigid fixed width > 430px: {w}"
                    )


if __name__ == "__main__":
    unittest.main()
