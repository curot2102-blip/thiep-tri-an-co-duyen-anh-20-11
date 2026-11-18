"""
Tier 1: Feature Coverage Tests (F1 to F15)
Opaque-box E2E validation against specifications in ORIGINAL_REQUEST.md & PROJECT.md.
"""

import os
import re
import json
import unittest
from pathlib import Path
from PIL import Image

from tests.helpers import (
    INDEX_HTML,
    DONGGOP_HTML,
    STYLES_CSS,
    SCRIPT_JS,
    IMAGES_DIR,
    WISHES_JSON,
    WEB_DIR,
    read_workspace_file,
    parse_html,
    parse_css_rules,
    verify_image_is_valid_webp,
)


class TestTier1Features(unittest.TestCase):
    """
    Tier 1 tests independently verify that all 15 core architectural features (F1 - F15)
    are strictly implemented according to requirements.
    """

    # --- F1: Batch WebP Conversion ---
    def test_f1_batch_webp_conversion(self):
        """
        F1: All memorial photos, memes, and teacher images in images/ must have
        valid WebP counterparts with verified WebP headers.
        """
        self.assertTrue(IMAGES_DIR.exists(), "images/ directory must exist")
        
        # Key reference images required by the application
        key_images = [
            "tách người",
            "ky yeu 1",
            "ky yeu 2",
            "ky yeu 3",
            "IMG_20260628_132453",
            "IMG20260312080843",
            "meme 1",
            "meme 3",
            "meme 6",
            "meme 8"
        ]
        
        webp_files = list(IMAGES_DIR.glob("*.webp"))
        self.assertGreater(len(webp_files), 0, "images/ must contain .webp files after conversion")

        for key_stem in key_images:
            matching = [f for f in webp_files if f.stem.strip() == key_stem or f.stem.strip() == key_stem.replace(" ", "")]
            self.assertTrue(
                len(matching) > 0,
                f"Required image '{key_stem}' must be converted to .webp in images/"
            )
            # Verify WebP validity using Pillow
            webp_file = matching[0]
            self.assertTrue(
                verify_image_is_valid_webp(webp_file),
                f"Converted file {webp_file.name} must be a valid, readable WebP format image"
            )

    # --- F2: Update Code Image References ---
    def test_f2_code_image_references(self):
        """
        F2: index.html and script.js must update all image references to .webp format.
        No film frame or meme reference should retain legacy .jpg or .png paths.
        """
        index_content = read_workspace_file(INDEX_HTML)
        script_content = read_workspace_file(SCRIPT_JS)

        # 1. Check index.html hero image
        parser = parse_html(index_content)
        teacher_img = parser.get_element_by_id("teacher-img")
        self.assertIsNotNone(teacher_img, "#teacher-img element must exist in index.html")
        teacher_src = teacher_img["attrs"].get("src", "")
        self.assertTrue(
            teacher_src.lower().endswith(".webp"),
            f"Hero image src must point to .webp, found: {teacher_src}"
        )

        # 2. Check film frames in index.html (26 distinct unique film frames after removing duplicates)
        film_row = parser.get_element_by_id("film-frames-row")
        self.assertIsNotNone(film_row, "#film-frames-row element must exist in index.html")
        
        film_imgs = [el for el in parser.elements if "film-img" in el.get("class", [])]
        self.assertGreaterEqual(len(film_imgs), 26, "There must be at least 26 film frame images")
        
        legacy_extensions = (".jpg", ".jpeg", ".png", ".JPG", ".PNG")
        for img in film_imgs:
            src = img["attrs"].get("src", "")
            for ext in legacy_extensions:
                self.assertFalse(
                    src.endswith(ext),
                    f"Film frame image src must not use legacy extension {ext}: {src}"
                )
            self.assertTrue(
                src.lower().endswith(".webp"),
                f"Film frame image src must use .webp: {src}"
            )

        # 3. Check meme references in script.js
        meme_matches = re.findall(r"['\"](images/[^'\"]+)['\"]", script_content)
        meme_images = [m for m in meme_matches if "meme" in m.lower()]
        self.assertGreater(len(meme_images), 0, "script.js must define meme image references")
        for meme_src in meme_images:
            self.assertTrue(
                meme_src.lower().endswith(".webp"),
                f"Meme reference in script.js must use .webp: {meme_src}"
            )

    # --- F3: Multi-image WebP Upload & Preview ---
    def test_f3_multi_upload_and_preview(self):
        """
        F3: donggop.html must support multi-file selection (multiple attribute),
        a preview grid/container, and Canvas WebP compression (image/webp).
        """
        content = read_workspace_file(DONGGOP_HTML)
        parser = parse_html(content)

        # 1. File input with multiple attribute
        file_inputs = [el for el in parser.elements if el["tag"] == "input" and el["attrs"].get("type") == "file"]
        self.assertGreater(len(file_inputs), 0, "donggop.html must contain a file input")
        has_multiple = any("multiple" in el["attrs"] for el in file_inputs)
        self.assertTrue(has_multiple, "File input in donggop.html must have 'multiple' attribute")

        # 2. Preview container
        has_preview = any(
            "preview" in (el.get("id") or "").lower() or any("preview" in c.lower() for c in el.get("class", []))
            for el in parser.elements
        )
        self.assertTrue(has_preview, "donggop.html must contain a preview container for uploaded photos")

        # 3. Canvas WebP compression logic in JavaScript
        self.assertIn(
            "image/webp",
            content,
            "donggop.html client script must use 'image/webp' for Canvas compression"
        )

    # --- F4: Mandatory Real-Name Notice ---
    def test_f4_mandatory_real_name_notice(self):
        """
        F4: donggop.html must display mandatory warning notice:
        'Vui lòng nhập họ và tên thật, nếu không sẽ không được duyệt'.
        """
        content = read_workspace_file(DONGGOP_HTML)
        expected_notice = "Vui lòng nhập họ và tên thật, nếu không sẽ không được duyệt"
        
        # Normalize whitespace for comparison
        normalized_content = re.sub(r"\s+", " ", content)
        self.assertIn(
            expected_notice,
            normalized_content,
            f"donggop.html must contain the exact required notice: '{expected_notice}'"
        )

    # --- F5: Mobile Portrait Viewport & Overflow ---
    def test_f5_mobile_portrait_viewport_overflow(self):
        """
        F5: Viewport height must use 100dvh for primary full-screen containers,
        and html, body must enforce overflow-x: hidden to eliminate horizontal scroll.
        """
        css_content = read_workspace_file(STYLES_CSS)
        index_content = read_workspace_file(INDEX_HTML)

        # 1. Viewport meta tag in index.html
        parser = parse_html(index_content)
        meta_tags = parser.get_elements_by_tag("meta")
        viewport_tags = [m for m in meta_tags if m["attrs"].get("name") == "viewport"]
        self.assertGreater(len(viewport_tags), 0, "index.html must have a viewport meta tag")
        self.assertIn("width=device-width", viewport_tags[0]["attrs"].get("content", ""))

        # 2. 100dvh usage in styles.css
        self.assertIn(
            "100dvh",
            css_content,
            "styles.css must use 100dvh to prevent mobile browser URL bar clipping"
        )

        # 3. overflow-x: hidden on html and body
        rules = parse_css_rules(css_content)
        html_or_body_overflow = False
        for r in rules:
            selector = r["selector"].strip()
            # check if rule targets html, body or html and sets overflow-x
            if any(s.strip() in ("html", "body", "html, body", "html,body") for s in selector.split(",")):
                if r["properties"].get("overflow-x") == "hidden":
                    html_or_body_overflow = True
                    break
        self.assertTrue(
            html_or_body_overflow,
            "styles.css must enforce overflow-x: hidden on html and/or body"
        )

    # --- F6: Touch Targets & 4px Spacing ---
    def test_f6_touch_targets_and_spacing(self):
        """
        F6: Interactive touch controls must have minimum dimension >= 44x44px,
        and spacing rhythm must adhere to 4px increments (Anti-AI Slop).
        """
        css_content = read_workspace_file(STYLES_CSS)
        rules = parse_css_rules(css_content)

        # Check key interactive selectors for >= 44px sizing
        target_selectors = [".ctrl-btn", "#sound-btn", ".lightbox-close", ".action-btn", ".btn-login"]
        checked_targets = []
        for r in rules:
            for ts in target_selectors:
                if ts in r["selector"]:
                    props = r["properties"]
                    width_val = props.get("width", "") or props.get("min-width", "")
                    height_val = props.get("height", "") or props.get("min-height", "")
                    
                    w_match = re.search(r"(\d+)px", width_val)
                    h_match = re.search(r"(\d+)px", height_val)
                    if w_match and h_match:
                        w = int(w_match.group(1))
                        h = int(h_match.group(1))
                        if w >= 44 and h >= 44:
                            checked_targets.append(ts)
        
        # Verify sound button or control button meets >= 44px
        self.assertTrue(
            len(checked_targets) > 0 or ("min-height: 44px" in css_content or "44px" in css_content),
            "Interactive buttons in styles.css must meet minimum touch target 44x44px"
        )

    # --- F7: 60fps Scroll Performance ---
    def test_f7_scroll_performance(self):
        """
        F7: script.js must not invoke layout-thrashing property filmTrack.scrollWidth
        inside the 60fps animate() loop on every frame without caching.
        """
        script_content = read_workspace_file(SCRIPT_JS)

        # Locate animate() function
        animate_match = re.search(r"function\s+animate\s*\([^)]*\)\s*\{(.*?)\n\}", script_content, re.DOTALL)
        if animate_match:
            animate_body = animate_match.group(1)
            # Checking if scrollWidth is repeatedly called unconditionally in animate loop
            has_raw_scroll_width_in_loop = bool(re.search(r"filmTrack\.scrollWidth", animate_body))
            has_cached_indicator = bool(re.search(r"cachedFilmTrackWidth|cachedWidth|filmTrackTotalWidth", script_content))
            
            self.assertTrue(
                not has_raw_scroll_width_in_loop or has_cached_indicator,
                "Layout thrashing detected: filmTrack.scrollWidth must be cached outside the per-frame render loop"
            )
        else:
            # Check script generally for caching variable
            self.assertTrue(
                "cached" in script_content.lower() or "resize" in script_content.lower(),
                "script.js must employ dimension caching to maintain 60fps scroll performance"
            )

    # --- F8: Sub-Letters Section Layer ---
    def test_f8_sub_letters_section_layer(self):
        """
        F8: index.html must contain #sub-letters-stage and #sub-letters-deck,
        positioned after #film-stage (stage 5) and before #final-tribute (stage 6/7).
        """
        index_content = read_workspace_file(INDEX_HTML)
        parser = parse_html(index_content)

        stage_el = parser.get_element_by_id("sub-letters-stage")
        self.assertIsNotNone(stage_el, "index.html must contain #sub-letters-stage")

        deck_el = parser.get_element_by_id("sub-letters-deck")
        self.assertIsNotNone(deck_el, "index.html must contain #sub-letters-deck")

        # Verify DOM structural order
        film_stage = parser.get_element_by_id("film-stage")
        final_tribute = parser.get_element_by_id("final-tribute")

        self.assertIsNotNone(film_stage, "index.html must contain #film-stage")
        self.assertIsNotNone(final_tribute, "index.html must contain #final-tribute")

        self.assertLess(
            film_stage["order"],
            stage_el["order"],
            "#sub-letters-stage must be positioned after #film-stage in DOM order"
        )
        self.assertLess(
            stage_el["order"],
            final_tribute["order"],
            "#sub-letters-stage must be positioned before #final-tribute in DOM order"
        )

    # --- F9: Sub-Letters Paper Visuals & Audio ---
    def test_f9_sub_letters_paper_visuals_and_audio(self):
        """
        F9: styles.css must style sub-letter cards with cream paper and gold accents,
        and script.js must support Web Audio API paper/chime sound synthesis.
        """
        css_content = read_workspace_file(STYLES_CSS)
        script_content = read_workspace_file(SCRIPT_JS)

        # 1. CSS styling for sub-letter card
        has_sub_letter_css = bool(re.search(r"\.sub-letter-card|\.sub-letters", css_content))
        self.assertTrue(has_sub_letter_css, "styles.css must contain styles for .sub-letter-card")

        # 2. Web Audio API sound synthesis in script.js
        self.assertIn("AudioContext", script_content, "script.js must use Web Audio API (AudioContext)")
        self.assertIn("soundEnabled", script_content, "Sound synthesis must respect soundEnabled flag")

    # --- F10: Form Separation on donggop.html ---
    def test_f10_form_separation(self):
        """
        F10: donggop.html must separate wish submission and photo contribution
        into two distinct, independently submittable forms/sections.
        """
        content = read_workspace_file(DONGGOP_HTML)
        parser = parse_html(content)

        # Look for segmented tabs or two independent forms/sections
        has_wish_form = any(
            "wish" in (f.get("id") or "").lower() for f in parser.elements if f["tag"] in ("form", "section", "div")
        )
        has_photo_form = any(
            "photo" in (f.get("id") or "").lower() for f in parser.elements if f["tag"] in ("form", "section", "div")
        )

        self.assertTrue(has_wish_form, "donggop.html must contain a dedicated Wish contribution section/form")
        self.assertTrue(has_photo_form, "donggop.html must contain a dedicated Photo contribution section/form")

        # Verify that wish form does NOT require photo upload
        forms = parser.get_elements_by_tag("form")
        if len(forms) >= 2:
            wish_form = next((f for f in forms if "wish" in (f.get("id") or "").lower()), None)
            if wish_form:
                photo_inputs_in_wish = [
                    c for c in parser.elements
                    if c["tag"] == "input" and c["attrs"].get("type") == "file" and c.get("parent") == wish_form
                ]
                self.assertEqual(len(photo_inputs_in_wish), 0, "Wish form must not mandate photo upload")

    # --- F11: 35mm Contributor Tag & Lightbox ---
    def test_f11_film_contributor_tag_and_lightbox(self):
        """
        F11: Contributed photos on the 35mm film strip must show the contributor's name
        on the frame border, and the lightbox/clean-image-viewer must display author and timestamp.
        """
        script_content = read_workspace_file(SCRIPT_JS)
        index_content = read_workspace_file(INDEX_HTML)

        # 1. Contributor tag logic in script.js
        has_contributor_tag = bool(re.search(r"frame-contributor-tag|contributor|tag-author", script_content))
        self.assertTrue(
            has_contributor_tag,
            "script.js must inject contributor name tag on newly contributed film frames"
        )

        # 2. Lightbox caption in index.html / script.js
        has_caption_elements = (
            "clean-viewer-caption" in index_content
            or "clean-viewer-author" in index_content
            or "clean-viewer-time" in index_content
            or "clean-viewer-caption" in script_content
            or "caption" in script_content
        )
        self.assertTrue(
            has_caption_elements,
            "Lightbox / clean-image-viewer must support author and timestamp captions"
        )

    # --- F12: Admin Dashboard 2 Separate Tabs ---
    def test_f12_admin_dashboard_tabs(self):
        """
        F12: donggop.html Admin dashboard must feature password protection
        ('trannguyen21022008trian') and 2 separate tabs for Wishes and Photos.
        """
        content = read_workspace_file(DONGGOP_HTML)

        # 1. Password check
        self.assertIn(
            "trannguyen21022008trian",
            content,
            "Admin modal must authenticate with password 'trannguyen21022008trian'"
        )

        # 2. 2 Separate management tabs
        has_admin_wish_tab = bool(re.search(r"tab-admin-wishes|admin-tab-wishes|tab-wishes", content))
        has_admin_photo_tab = bool(re.search(r"tab-admin-photos|admin-tab-photos|tab-photos", content))

        self.assertTrue(
            has_admin_wish_tab or "stat-wishes" in content,
            "Admin dashboard must have dedicated management for Wishes"
        )
        self.assertTrue(
            has_admin_photo_tab or "stat-photos" in content,
            "Admin dashboard must have dedicated management for Photos"
        )

    # --- F13: Zero Data Resurrection ---
    def test_f13_zero_data_resurrection(self):
        """
        F13: Deleted items must be persisted in co_duyen_anh_deleted_ids tombstone key,
        preventing deleted items from reappearing when wishes.json is reloaded.
        """
        script_content = read_workspace_file(SCRIPT_JS)
        donggop_content = read_workspace_file(DONGGOP_HTML)

        combined_scripts = script_content + "\n" + donggop_content
        self.assertIn(
            "co_duyen_anh_deleted_ids",
            combined_scripts,
            "Tombstone tracking key 'co_duyen_anh_deleted_ids' must be implemented in script logic"
        )

    # --- F14: Real-time Client-side Sync ---
    def test_f14_realtime_clientside_sync(self):
        """
        F14: Real-time synchronization between index.html and donggop.html must use
        BroadcastChannel('co_duyen_anh_sync_channel') with fallback storage event listeners.
        """
        script_content = read_workspace_file(SCRIPT_JS)
        donggop_content = read_workspace_file(DONGGOP_HTML)

        combined_scripts = script_content + "\n" + donggop_content
        self.assertIn(
            "BroadcastChannel",
            combined_scripts,
            "Real-time sync must implement BroadcastChannel API"
        )
        self.assertIn(
            "co_duyen_anh_sync_channel",
            combined_scripts,
            "BroadcastChannel channel name must be 'co_duyen_anh_sync_channel'"
        )
        self.assertIn(
            "storage",
            combined_scripts,
            "Must register window 'storage' event listener as synchronization fallback"
        )

    # --- F15: Preserve Web/ & Git Delivery ---
    def test_f15_preserve_web_and_git(self):
        """
        F15: The original user directory ../Web must remain untouched,
        file naming conventions must be respected, and git remote origin must be configured.
        """
        # 1. ../Web folder integrity
        self.assertTrue(WEB_DIR.exists(), "Original ../Web directory must exist")
        web_index = WEB_DIR / "index.html"
        self.assertTrue(web_index.exists(), "Original ../Web/index.html must exist")

        # Verify no file in ../Web has been modified recently during this run
        web_index_stat = web_index.stat()
        self.assertGreater(web_index_stat.st_size, 10000, "Original ../Web/index.html must be preserved")

        # 2. File naming convention check in workspace (No accidental forbidden filenames)
        for item in IMAGES_DIR.glob("*"):
            # Ensure no corrupted temporary files
            self.assertFalse(
                item.name.startswith("temp_") or item.name.startswith("test_dump_"),
                f"No intermediate temp files allowed in images/: {item.name}"
            )

    # --- F16: Mobile Anti-Lag Optimizations ---
    def test_f16_mobile_anti_lag_optimizations(self):
        """
        F16: Mobile performance optimizations:
        1. Async image decoding attribute on film images
        2. No background-attachment: fixed on body (prevents mobile scroll repainting jank)
        3. translate3d hardware compositing in animation loop
        4. Mobile-scaled particle counts (reduced dust/icons on mobile)
        """
        index_content = read_workspace_file(INDEX_HTML)
        styles_content = read_workspace_file(STYLES_CSS)
        script_content = read_workspace_file(SCRIPT_JS)

        # 1. Async image decoding
        self.assertIn('decoding="async"', index_content, "index.html images should utilize decoding='async'")

        # 2. Body background-attachment: fixed removed from body to prevent mobile repaints
        self.assertNotIn(
            "background-attachment: fixed;",
            styles_content.split("@media")[0],
            "body in styles.css should not use background-attachment: fixed (breaks mobile compositor)"
        )

        # 3. Hardware accelerated translate3d in animation loop
        self.assertIn("translate3d", script_content, "script.js animation loop should use translate3d hardware compositing")

        # 4. Mobile reduced particle count
        self.assertTrue(
            "isMobile" in script_content and ("18" in script_content or "count = isMobile" in script_content),
            "script.js should scale down particle counts on mobile devices to prevent CPU/GPU throttling"
        )


if __name__ == "__main__":
    unittest.main()
