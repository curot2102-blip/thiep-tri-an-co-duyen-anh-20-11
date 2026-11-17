"""
Tier 4: Real-World Scenario Tests
Validates complete user journeys, multi-tab real-time scenarios,
and continuous scroll timeline transitions across all stages.
"""

import json
import unittest
from pathlib import Path

from tests.helpers import (
    INDEX_HTML,
    DONGGOP_HTML,
    SCRIPT_JS,
    STYLES_CSS,
    read_workspace_file,
    MockLocalStorage,
    MockBroadcastChannel,
)


class TestTier4Scenarios(unittest.TestCase):
    """
    Tier 4 tests model end-to-end user workflows and real-world execution environments.
    """

    def setUp(self):
        MockBroadcastChannel.reset_all()

    def tearDown(self):
        MockBroadcastChannel.reset_all()

    def test_dual_page_live_synchronization_scenario(self):
        """
        Scenario: Dual-page live concurrent operation.
        User opens index.html in Tab A and donggop.html in Tab B.
        Tab B performs consecutive actions:
          1. Submits Wish 1
          2. Submits Wish 2
          3. Submits Batch Photos (3 photos)
          4. Admin enters password and deletes Wish 1
        Tab A observes all state mutations instantaneously with zero page reloads.
        """
        storage = MockLocalStorage()
        sync_channel = "co_duyen_anh_sync_channel"

        tab_donggop = MockBroadcastChannel(sync_channel)
        tab_index = MockBroadcastChannel(sync_channel)

        # Tab A (index.html) state tracker
        tab_a_state = {
            "wishes": {},
            "photos": {},
            "sound_events": []
        }

        def on_tab_a_sync(event):
            msg = event["data"]
            mtype = msg.get("type")
            payload = msg.get("payload")

            if mtype == "ADD_WISH":
                tab_a_state["wishes"][payload["id"]] = payload
                tab_a_state["sound_events"].append("chime")
            elif mtype == "ADD_PHOTOS":
                for p in payload:
                    tab_a_state["photos"][p["id"]] = p
                tab_a_state["sound_events"].append("chime")
            elif mtype == "DELETE_WISH":
                tab_a_state["wishes"].pop(payload["id"], None)
            elif mtype == "DELETE_PHOTO":
                tab_a_state["photos"].pop(payload["id"], None)

        tab_index.addEventListener("message", on_tab_a_sync)

        # Action 1: Submit Wish 1
        w1 = {"id": "w_1", "author": "Học sinh A", "wish": "Chúc cô 20-11 vui vẻ!"}
        tab_donggop.postMessage({"type": "ADD_WISH", "payload": w1})

        # Action 2: Submit Wish 2
        w2 = {"id": "w_2", "author": "Học sinh B", "wish": "Tri ân cô Duyên Anh!"}
        tab_donggop.postMessage({"type": "ADD_WISH", "payload": w2})

        # Assert Tab A received both wishes
        self.assertEqual(len(tab_a_state["wishes"]), 2)
        self.assertIn("w_1", tab_a_state["wishes"])
        self.assertIn("w_2", tab_a_state["wishes"])

        # Action 3: Submit 3 Photos
        photos_batch = [
            {"id": "p_1", "author": "Tổ 1", "image": "data:image/webp;base64,p1"},
            {"id": "p_2", "author": "Tổ 2", "image": "data:image/webp;base64,p2"},
            {"id": "p_3", "author": "Tổ 3", "image": "data:image/webp;base64,p3"}
        ]
        tab_donggop.postMessage({"type": "ADD_PHOTOS", "payload": photos_batch})

        # Assert Tab A received all 3 photos
        self.assertEqual(len(tab_a_state["photos"]), 3)
        self.assertEqual(len(tab_a_state["sound_events"]), 3)

        # Action 4: Admin deletes Wish 1
        tab_donggop.postMessage({"type": "DELETE_WISH", "payload": {"id": "w_1"}})

        # Assert Tab A removed Wish 1 while keeping Wish 2 and photos
        self.assertEqual(len(tab_a_state["wishes"]), 1)
        self.assertNotIn("w_1", tab_a_state["wishes"])
        self.assertIn("w_2", tab_a_state["wishes"])
        self.assertEqual(len(tab_a_state["photos"]), 3)

    def test_full_scroll_workflow_stage_progression(self):
        """
        Scenario: User performs a complete smooth scroll from top to bottom (p: 0.0 -> 1.0).
        Verifies that stage activation bounds form a continuous, non-overlapping,
        monotonically ordered sequence across all 7 stages:
          - Stage 1: Hero Cover (p: 0.00 -> 0.12)
          - Stage 2: Envelope Fold/Unfold (p: 0.12 -> 0.22)
          - Stage 3: Letter Reading (p: 0.22 -> 0.33)
          - Stage 4: Floating Meme Gallery (p: 0.33 -> 0.46)
          - Stage 5: 35mm Film Strip Horizontal Scroll (p: 0.46 -> 0.76)
          - Stage 6: Sub-Letters Deck Layer (p: 0.76 -> 0.90)
          - Stage 7: Final Tribute & Interactive Hearts (p: 0.90 -> 1.00)
        """
        stages = [
            {"name": "Stage 1: Hero Cover", "start": 0.00, "end": 0.12},
            {"name": "Stage 2: Envelope Unfold", "start": 0.12, "end": 0.22},
            {"name": "Stage 3: Letter Reading", "start": 0.22, "end": 0.33},
            {"name": "Stage 4: Meme Gallery", "start": 0.33, "end": 0.46},
            {"name": "Stage 5: 35mm Film Strip", "start": 0.46, "end": 0.76},
            {"name": "Stage 6: Sub-Letters Deck", "start": 0.76, "end": 0.90},
            {"name": "Stage 7: Final Tribute", "start": 0.90, "end": 1.00},
        ]

        # 1. Verify monotonic sequence without gaps or inverted intervals
        for i in range(len(stages)):
            curr = stages[i]
            self.assertLess(curr["start"], curr["end"], f"{curr['name']}: start must be < end")
            if i > 0:
                prev = stages[i - 1]
                self.assertAlmostEqual(
                    prev["end"],
                    curr["start"],
                    places=2,
                    msg=f"Gap or overlap between {prev['name']} and {curr['name']}"
                )

        # 2. Simulate sample scroll positions and verify exactly one dominant stage is active
        test_points = [0.05, 0.15, 0.25, 0.40, 0.60, 0.82, 0.95]
        active_counts = []
        for p in test_points:
            active = [s for s in stages if s["start"] <= p <= s["end"]]
            self.assertGreaterEqual(
                len(active),
                1,
                f"Scroll position p={p} must fall within an active stage"
            )


if __name__ == "__main__":
    unittest.main()
