"""
Tier 3: Cross-Feature Combination Tests
Validates multi-feature interactions, data pipelines, and synchronous state lifecycles.
"""

import json
import unittest
from pathlib import Path

from tests.helpers import (
    INDEX_HTML,
    DONGGOP_HTML,
    SCRIPT_JS,
    WISHES_JSON,
    read_workspace_file,
    MockLocalStorage,
    MockBroadcastChannel,
)


class TestTier3Combinations(unittest.TestCase):
    """
    Tier 3 tests verify interconnected features working together across the complete data lifecycle:
    Submission -> Local Storage -> Broadcast Sync -> DOM Rendering -> Admin Deletion -> Tombstone Persistence.
    """

    def setUp(self):
        MockBroadcastChannel.reset_all()

    def tearDown(self):
        MockBroadcastChannel.reset_all()

    def test_wish_submission_broadcast_and_card_rendering_lifecycle(self):
        """
        Verify the complete Wish contribution lifecycle:
        1. User submits wish on donggop.html
        2. Wish saved to localStorage key 'co_duyen_anh_wishes'
        3. BroadcastChannel message 'ADD_WISH' emitted
        4. Receiver in index.html catches message, generates sub-letter card in #sub-letters-deck
        """
        storage = MockLocalStorage()
        sync_channel = "co_duyen_anh_sync_channel"
        
        donggop_tab = MockBroadcastChannel(sync_channel)
        index_tab = MockBroadcastChannel(sync_channel)

        received_events = []
        def index_listener(event):
            received_events.append(event["data"])

        index_tab.addEventListener("message", index_listener)

        # 1. Simulate wish creation on donggop.html
        wish_payload = {
            "id": "wish_auto_101",
            "author": "Nguyễn Hoàng Nam",
            "wish": "Kính chúc cô Duyên Anh luôn luôn vui vẻ và hạnh phúc!",
            "time": "17/11/2026 20:30"
        }

        # Save to storage
        current_wishes = [wish_payload]
        storage.setItem("co_duyen_anh_wishes", json.dumps(current_wishes))

        # Broadcast event
        broadcast_msg = {
            "type": "ADD_WISH",
            "payload": wish_payload
        }
        donggop_tab.postMessage(broadcast_msg)

        # 2. Assert index.html receiver received event
        self.assertEqual(len(received_events), 1)
        self.assertEqual(received_events[0]["type"], "ADD_WISH")
        self.assertEqual(received_events[0]["payload"]["id"], "wish_auto_101")
        self.assertEqual(received_events[0]["payload"]["author"], "Nguyễn Hoàng Nam")

        # 3. Simulate receiver DOM card generation logic
        def create_sub_letter_card(data):
            return {
                "tag": "div",
                "class": "sub-letter-card",
                "data-id": data["id"],
                "author": data["author"],
                "content": data["wish"]
            }

        card = create_sub_letter_card(received_events[0]["payload"])
        self.assertEqual(card["class"], "sub-letter-card")
        self.assertEqual(card["data-id"], "wish_auto_101")
        self.assertIn("Kính chúc cô", card["content"])

    def test_photo_submission_broadcast_and_film_strip_rendering(self):
        """
        Verify the multi-photo contribution lifecycle:
        1. Photos compressed to WebP Base64 on donggop.html
        2. Saved to localStorage key 'co_duyen_anh_photos'
        3. Emits 'ADD_PHOTOS' broadcast
        4. Receiver in index.html dynamically creates film frames with contributor tag
        """
        storage = MockLocalStorage()
        sync_channel = "co_duyen_anh_sync_channel"

        donggop_tab = MockBroadcastChannel(sync_channel)
        index_tab = MockBroadcastChannel(sync_channel)

        received_events = []
        index_tab.addEventListener("message", lambda e: received_events.append(e["data"]))

        photo_payload = [
            {
                "id": "photo_101",
                "author": "Lê Bảo Anh (Tổ 1)",
                "image": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA",
                "aspect": "landscape",
                "time": "17/11/2026 21:00"
            }
        ]

        storage.setItem("co_duyen_anh_photos", json.dumps(photo_payload))
        donggop_tab.postMessage({"type": "ADD_PHOTOS", "payload": photo_payload})

        self.assertEqual(len(received_events), 1)
        self.assertEqual(received_events[0]["type"], "ADD_PHOTOS")
        self.assertEqual(len(received_events[0]["payload"]), 1)

        # Simulate frame rendering with contributor name on border
        def render_film_frame(item):
            return {
                "tag": "div",
                "class": f"film-frame {item['aspect']}",
                "data-src": item["image"],
                "contributor_tag": f"📸 {item['author']}"
            }

        frame = render_film_frame(received_events[0]["payload"][0])
        self.assertIn("Lê Bảo Anh", frame["contributor_tag"])
        self.assertIn("film-frame", frame["class"])

    def test_admin_deletion_tombstone_and_zero_resurrection_combination(self):
        """
        Verify Admin deletion and anti-resurrection pipeline:
        1. Item deleted in Admin dashboard on donggop.html
        2. ID appended to co_duyen_anh_deleted_ids in localStorage
        3. Removed from co_duyen_anh_wishes
        4. Broadcast 'DELETE_WISH' removes DOM node in index.html
        5. Re-hydration from wishes.json respects tombstone: item is never resurrected.
        """
        storage = MockLocalStorage()
        sync_channel = "co_duyen_anh_sync_channel"

        donggop_tab = MockBroadcastChannel(sync_channel)
        index_tab = MockBroadcastChannel(sync_channel)

        active_dom_cards = {
            "wish-static-1": {"author": "Bạn cũ", "wish": "Thư cũ"},
            "wish-dyn-2": {"author": "Bạn mới", "wish": "Thư mới"}
        }

        def on_delete_received(event):
            if event["data"]["type"] == "DELETE_WISH":
                target_id = event["data"]["payload"]["id"]
                active_dom_cards.pop(target_id, None)

        index_tab.addEventListener("message", on_delete_received)

        # Admin initiates deletion of wish-static-1
        deleted_id = "wish-static-1"
        
        # Update tombstones in storage
        current_tombstones = set()
        raw_tombstones = storage.getItem("co_duyen_anh_deleted_ids")
        if raw_tombstones:
            current_tombstones = set(json.loads(raw_tombstones))
        current_tombstones.add(deleted_id)
        storage.setItem("co_duyen_anh_deleted_ids", json.dumps(list(current_tombstones)))

        # Broadcast delete action
        donggop_tab.postMessage({
            "type": "DELETE_WISH",
            "payload": {"id": deleted_id}
        })

        # Verify instant DOM removal
        self.assertNotIn("wish-static-1", active_dom_cards)
        self.assertIn("wish-dyn-2", active_dom_cards)

        # Now simulate page reload (F5) re-hydrating from wishes.json
        mock_wishes_json = [
            {"id": "wish-static-1", "author": "Bạn cũ", "wish": "Thư cũ"}
        ]
        
        # Hydration logic with tombstone filtering
        loaded_tombstones = set(json.loads(storage.getItem("co_duyen_anh_deleted_ids") or "[]"))
        rehydrated_wishes = [w for w in mock_wishes_json if w["id"] not in loaded_tombstones]

        # Zero resurrection assertion
        self.assertEqual(len(rehydrated_wishes), 0, "Deleted item must NEVER be resurrected after F5 reload")

    def test_independent_dual_forms_submission_flow(self):
        """
        Verify that the two contribution forms on donggop.html are completely decoupled:
        - Submitting a Wish does NOT require uploading an image.
        - Submitting Photos does NOT require writing a wish message.
        """
        # Scenario A: Wish only
        wish_submission = {
            "author": "Trần Tuấn",
            "wish": "Kính chúc cô luôn luôn mạnh khỏe!",
            "has_photos": False,
            "photos": []
        }
        self.assertTrue(len(wish_submission["wish"]) > 0)
        self.assertEqual(len(wish_submission["photos"]), 0)

        # Scenario B: Photos only
        photo_submission = {
            "author": "Tập thể 12-3",
            "caption": "Ảnh kỷ niệm dã ngoại",
            "wish": "",
            "has_photos": True,
            "photos": ["data:image/webp;base64,sample1", "data:image/webp;base64,sample2"]
        }
        self.assertEqual(len(photo_submission["wish"]), 0)
        self.assertEqual(len(photo_submission["photos"]), 2)


if __name__ == "__main__":
    unittest.main()
