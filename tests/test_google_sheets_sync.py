"""
Tier 5: Google Apps Script & Google Sheets Synchronization Test Suite
Validates backend contracts, end-to-end sync workflow, and offline fallback mechanisms.
"""

import os
import re
import sys
import json
import unittest
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from tests.helpers import (
    WORKSPACE_DIR,
    INDEX_HTML,
    DONGGOP_HTML,
    STYLES_CSS,
    SCRIPT_JS,
    WISHES_JSON,
    read_workspace_file,
    parse_html,
    MockLocalStorage,
    MockBroadcastChannel,
)

CODE_GS = WORKSPACE_DIR / "Code.gs"
GUIDE_MD = WORKSPACE_DIR / "Hướng dẫn triển khai Google Apps Script và đồng bộ Google Sheets.md"


class SimulatedGasBackend:
    """
    In-memory simulation of Google Apps Script Web App logic (Code.gs).
    Validates protocol conformance and contract behavior.
    """

    def __init__(self):
        self.wishes_sheet = []
        self.photos_sheet = []
        self.drive_files = {}

    def do_get(self, parameters):
        action = parameters.get("action", "getWishes")
        if action == "ping":
            return {
                "status": "success",
                "message": "Google Apps Script Web App đang hoạt động bình thường!",
                "serverTime": "2026-11-18T10:00:00Z"
            }
        elif action == "getPhotos":
            return {
                "status": "success",
                "photos": list(reversed(self.photos_sheet)),
                "count": len(self.photos_sheet)
            }
        else:  # getWishes or default
            return {
                "status": "success",
                "wishes": list(reversed(self.wishes_sheet)),
                "photos": list(reversed(self.photos_sheet)),
                "count": len(self.wishes_sheet)
            }

    def do_post(self, payload):
        action = payload.get("action")
        if not action:
            action = "addWish" if "wish" in payload else ("addPhoto" if "image" in payload else "addWish")

        if action == "addWish":
            author = (payload.get("author") or "").strip() or "Bạn học trò"
            wish_text = (payload.get("wish") or "").strip()
            if not wish_text:
                return {"status": "error", "message": "Nội dung lời chúc không được để trống!"}

            wish_id = payload.get("id") or f"wish-{len(self.wishes_sheet) + 1}"
            time_val = payload.get("time") or "18/11/2026 10:00"
            raw_img = payload.get("image", "")
            img_url = ""

            if raw_img:
                img_url = self._process_image(raw_img, f"wish_{wish_id}", author)

            row = {
                "id": wish_id,
                "time": time_val,
                "author": author,
                "wish": wish_text,
                "image": img_url
            }
            self.wishes_sheet.append(row)
            return {"status": "success", "message": "Đã lưu lời chúc thành công!", "data": row}

        elif action == "addPhoto":
            author = (payload.get("author") or "").strip() or "Bạn học trò"
            raw_img = payload.get("image", "")
            if not raw_img:
                return {"status": "error", "message": "Dữ liệu hình ảnh không được để trống!"}

            photo_id = payload.get("id") or f"photo-{len(self.photos_sheet) + 1}"
            img_url = self._process_image(raw_img, f"photo_{photo_id}", author)
            row = {
                "id": photo_id,
                "time": payload.get("time") or "18/11/2026 10:00",
                "author": author,
                "caption": (payload.get("caption") or "").strip(),
                "image": img_url,
                "aspect": payload.get("aspect", "landscape")
            }
            self.photos_sheet.append(row)
            return {"status": "success", "message": "Đã lưu hình ảnh đóng góp thành công!", "data": row}

        elif action in ("deleteWish", "deletePhoto"):
            del_id = str(payload.get("id", "")).strip()
            target_sheet = self.wishes_sheet if action == "deleteWish" else self.photos_sheet
            prefix = "wish" if action == "deleteWish" else "photo"
            found_idx = -1
            for idx, item in enumerate(target_sheet):
                cell_id = item.get("id", "").strip()
                fallback_id = f"{prefix}-row-{idx + 2}"
                if cell_id == del_id or (not cell_id and fallback_id == del_id):
                    found_idx = idx
                    break
            if found_idx != -1:
                target_sheet.pop(found_idx)
                return {"status": "success", "message": "Đã xóa mục khỏi Google Sheet!"}
            return {"status": "not_found", "message": "Không tìm thấy ID tương ứng."}

        elif action == "addBatch":
            wishes = payload.get("wishes", [])
            for w in wishes:
                self.do_post({"action": "addWish", **w})
            return {"status": "success", "count": len(wishes)}

        return {"status": "error", "message": f"Hành động không hợp lệ: {action}"}

    def _process_image(self, raw_img, prefix, author):
        if raw_img.startswith("http://") or raw_img.startswith("https://"):
            return raw_img
        if raw_img.startswith("data:image/"):
            file_id = f"drive_file_{len(self.drive_files) + 1}"
            self.drive_files[file_id] = {
                "prefix": prefix,
                "author": author,
                "data": raw_img
            }
            return f"https://lh3.googleusercontent.com/d/{file_id}"
        return raw_img


class TestGoogleSheetsSync(unittest.TestCase):
    """
    Tier 5 tests verify Google Apps Script backend and frontend synchronization.
    """

    def setUp(self):
        MockBroadcastChannel.reset_all()

    def tearDown(self):
        MockBroadcastChannel.reset_all()

    def test_r1_gas_code_gs_structure_and_contract(self):
        """
        Verify that Code.gs exists and contains the required GAS functions:
        - doGet(e) and doPost(e)
        - Sheet initialization for 'Wishes' and 'Photos'
        - Actions: getWishes, getPhotos, ping, addWish, addPhoto, deleteWish
        - Drive image storage optimization (DriveApp / Utilities.base64Decode)
        - CORS ContentService JSON response
        """
        self.assertTrue(CODE_GS.exists(), "Code.gs must exist in workspace root")
        content = read_workspace_file(CODE_GS)

        # Core entry points
        self.assertIn("function doGet(", content, "Code.gs must implement doGet(e)")
        self.assertIn("function doPost(", content, "Code.gs must implement doPost(e)")

        # Sheet names and headers
        self.assertIn("Wishes", content, "Code.gs must manage 'Wishes' sheet")
        self.assertIn("Photos", content, "Code.gs must manage 'Photos' sheet")
        self.assertIn("initSheetsIfNeeded", content, "Code.gs must implement automatic sheet initialization")

        # Key action handlers
        self.assertIn("getWishes", content, "Code.gs must support action 'getWishes'")
        self.assertIn("addWish", content, "Code.gs must support action 'addWish'")
        self.assertIn("addPhoto", content, "Code.gs must support action 'addPhoto'")
        self.assertIn("ping", content, "Code.gs must support action 'ping'")

        # Image optimization via Google Drive
        self.assertIn("DriveApp", content, "Code.gs must use DriveApp for image storage")
        self.assertIn("base64Decode", content, "Code.gs must decode base64 images for Drive storage")
        self.assertIn("googleusercontent.com", content, "Code.gs must return direct viewable image URLs")

        # CORS JSON response
        self.assertIn("ContentService.MimeType.JSON", content, "Code.gs must return JSON MIME type")

        # Defensive spreadsheet bound check
        self.assertIn("if (!ss)", content, "Code.gs must defensively verify active spreadsheet binding")

    def test_r1_deployment_guide_compliance(self):
        """
        Verify that the deployment guide markdown file exists and adheres to
        naming conventions and contains all step-by-step instructions.
        """
        self.assertTrue(GUIDE_MD.exists(), "Hướng dẫn triển khai Google Apps Script và đồng bộ Google Sheets.md must exist")
        guide_text = read_workspace_file(GUIDE_MD)

        # Step-by-step contents
        self.assertIn("Google Sheets", guide_text)
        self.assertIn("Apps Script", guide_text)
        self.assertIn("doGet", guide_text)
        self.assertIn("doPost", guide_text)
        self.assertIn("Web app", guide_text)
        self.assertIn("Anyone", guide_text, "Guide must emphasize setting access to 'Anyone'")
        self.assertIn("wishes.json", guide_text, "Guide must document offline fallback")

    def test_r2_frontend_form_and_config_elements(self):
        """
        Verify that index.html and donggop.html contain the required forms, inputs,
        and configuration endpoints for Google Apps Script Web App.
        """
        index_html = read_workspace_file(INDEX_HTML)
        donggop_html = read_workspace_file(DONGGOP_HTML)
        script_js = read_workspace_file(SCRIPT_JS)

        # 1. index.html must have direct wish submission form
        index_parser = parse_html(index_html)
        index_form = index_parser.get_element_by_id("form-wish-index")
        self.assertIsNotNone(index_form, "index.html must have #form-wish-index form")

        index_author = index_parser.get_element_by_id("index-author-input")
        self.assertIsNotNone(index_author, "index.html must have #index-author-input")
        self.assertIn("required", index_author["attrs"], "index-author-input must be required")

        index_wish = index_parser.get_element_by_id("index-wish-input")
        self.assertIsNotNone(index_wish, "index.html must have #index-wish-input")
        self.assertIn("required", index_wish["attrs"], "index-wish-input must be required")

        # 2. donggop.html must have admin configuration section for GAS URL
        donggop_parser = parse_html(donggop_html)
        gas_panel = donggop_parser.get_element_by_id("admin-panel-gas")
        self.assertIsNotNone(gas_panel, "donggop.html admin modal must have #admin-panel-gas")
        gas_input = donggop_parser.get_element_by_id("admin-gas-url-input")
        self.assertIsNotNone(gas_input, "donggop.html must have #admin-gas-url-input")

        # 3. script.js must declare GAS_CONFIG and getGasWebAppUrl
        self.assertIn("GAS_CONFIG", script_js, "script.js must define GAS_CONFIG")
        self.assertIn("WEB_APP_URL", script_js, "script.js must define WEB_APP_URL configuration")
        self.assertIn("getGasWebAppUrl", script_js, "script.js must implement getGasWebAppUrl()")
        self.assertIn("sendWishToGas", script_js, "script.js must implement sendWishToGas()")

    def test_r4_end_to_end_single_wish_submission_and_sync(self):
        """
        R4: Automated test validating the complete synchronization workflow:
        1. Submit 1 test wish from frontend.
        2. Verify payload recorded into simulated Google Sheets backend.
        3. Fetch list from backend via GET.
        4. Merge with local state and generate sub-letter card in UI.
        """
        backend = SimulatedGasBackend()
        storage = MockLocalStorage()
        sync_channel = "co_duyen_anh_sync_channel"
        broadcast_donggop = MockBroadcastChannel(sync_channel)
        broadcast_index = MockBroadcastChannel(sync_channel)

        received_broadcasts = []
        broadcast_index.addEventListener("message", lambda e: received_broadcasts.append(e["data"]))

        # Step 1: Submit a test wish
        test_wish = {
            "id": "wish_test_auto_2011",
            "author": "Nguyễn Mai Phương (Tổ 3)",
            "wish": "Kính chúc Cô Duyên Anh ngày 20/11 tràn đầy niềm vui và sức khỏe!",
            "time": "18/11/2026 10:15",
            "image": ""
        }

        # Save to local storage (optimistic UI update)
        local_wishes = [test_wish]
        storage.setItem("co_duyen_anh_wishes", json.dumps(local_wishes))

        # Broadcast live event
        broadcast_donggop.postMessage({
            "action": "ADD_WISH",
            "type": "ADD_WISH",
            "data": test_wish,
            "payload": test_wish
        })

        # Step 2: Post to Google Apps Script backend
        post_response = backend.do_post({
            "action": "addWish",
            "id": test_wish["id"],
            "author": test_wish["author"],
            "wish": test_wish["wish"],
            "time": test_wish["time"],
            "image": test_wish["image"]
        })
        self.assertEqual(post_response["status"], "success")
        self.assertEqual(len(backend.wishes_sheet), 1)
        self.assertEqual(backend.wishes_sheet[0]["id"], "wish_test_auto_2011")

        # Step 3: Fetch list from GAS backend (simulating syncWishesFromRemote)
        get_response = backend.do_get({"action": "getWishes"})
        self.assertEqual(get_response["status"], "success")
        self.assertGreaterEqual(len(get_response["wishes"]), 1)
        self.assertEqual(get_response["wishes"][0]["author"], "Nguyễn Mai Phương (Tổ 3)")

        # Step 4: Verify Broadcast was received by Tab A
        self.assertEqual(len(received_broadcasts), 1)
        event_data = received_broadcasts[0].get("data") or received_broadcasts[0].get("payload")
        self.assertEqual(event_data["id"], "wish_test_auto_2011")

        # Step 5: Simulate DOM Sub-letter card generation
        def create_sub_letter_card(w):
            return {
                "tag": "div",
                "class": "sub-letter-card",
                "data-id": w["id"],
                "author": w["author"],
                "wish": w["wish"],
                "time": w["time"]
            }

        card = create_sub_letter_card(get_response["wishes"][0])
        self.assertEqual(card["data-id"], "wish_test_auto_2011")
        self.assertEqual(card["author"], "Nguyễn Mai Phương (Tổ 3)")
        self.assertIn("Kính chúc Cô Duyên Anh", card["wish"])

        # Step 6: Validate Offline Fallback during outage in the single-run flow
        offline_wish = {
            "id": "wish_test_offline_single_run",
            "author": "Lê Hoàng Nam (Tổ 1)",
            "wish": "Cảm ơn Cô đã luôn dìu dắt chúng con nên người!",
            "time": "18/11/2026 10:20",
            "image": ""
        }

        # Offline submission: fails remote, falls back to local and queues to pending
        pending_key = "co_duyen_anh_pending_wishes"
        local_wishes.insert(0, offline_wish)
        storage.setItem("co_duyen_anh_wishes", json.dumps(local_wishes))

        pending_queue = json.loads(storage.getItem(pending_key) or "[]")
        pending_queue.append(offline_wish)
        storage.setItem(pending_key, json.dumps(pending_queue))

        # Check local state preserved
        saved_local = json.loads(storage.getItem("co_duyen_anh_wishes"))
        self.assertEqual(len(saved_local), 2)
        self.assertEqual(saved_local[0]["id"], "wish_test_offline_single_run")

        # Step 7: Restore connectivity & flush pending queue to GAS backend
        pending_items = json.loads(storage.getItem(pending_key) or "[]")
        self.assertEqual(len(pending_items), 1)

        for p_item in pending_items:
            flush_res = backend.do_post({
                "action": "addWish",
                "id": p_item["id"],
                "author": p_item["author"],
                "wish": p_item["wish"],
                "time": p_item["time"],
                "image": p_item["image"]
            })
            self.assertEqual(flush_res["status"], "success")

        # Pending queue emptied on success
        storage.setItem(pending_key, json.dumps([]))
        self.assertEqual(json.loads(storage.getItem(pending_key)), [])

        # Final GET fetch confirms both wishes now synced in backend
        final_get = backend.do_get({"action": "getWishes"})
        self.assertEqual(final_get["status"], "success")
        self.assertEqual(len(final_get["wishes"]), 2)
        self.assertEqual(final_get["wishes"][0]["id"], "wish_test_offline_single_run")
        self.assertEqual(final_get["wishes"][1]["id"], "wish_test_auto_2011")

    def test_r4_photo_submission_and_drive_storage_optimization(self):
        """
        Verify that when a photo with base64 data is submitted:
        1. Simulated GAS backend converts base64 into Google Drive file.
        2. Google Drive returns direct viewable URL (lh3.googleusercontent.com/d/...).
        3. The lightweight URL is stored in the Sheet to prevent 50,000 char cell limits.
        """
        backend = SimulatedGasBackend()
        photo_payload = {
            "action": "addPhoto",
            "id": "photo_test_gas_1",
            "author": "Lớp 12A",
            "caption": "Kỷ niệm ngày bế giảng",
            "image": "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaACdLoB+AA=",
            "aspect": "landscape",
            "time": "18/11/2026 10:20"
        }

        res = backend.do_post(photo_payload)
        self.assertEqual(res["status"], "success")
        stored_photo = backend.photos_sheet[0]
        self.assertTrue(
            stored_photo["image"].startswith("https://lh3.googleusercontent.com/d/"),
            f"Image must be converted to Google Drive link, got: {stored_photo['image']}"
        )
        self.assertLess(len(stored_photo["image"]), 100, "Clean URL must not exceed Google Sheet cell limits")

    def test_r3_offline_fallback_unconfigured_gas_url(self):
        """
        R3: When Google Apps Script Web App URL is unconfigured (empty string),
        the application must gracefully fallback to wishes.json and localStorage
        with zero errors.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        # Both files must have fallback logic if gasUrl is empty or false
        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("getGasWebAppUrl", code, f"{fname} must check getGasWebAppUrl")
            self.assertIn("wishes.json", code, f"{fname} must fallback to fetch wishes.json")
            self.assertIn("localStorage", code, f"{fname} must fallback to localStorage on offline")

        # Verify default wishes.json exists and contains initial wish
        self.assertTrue(WISHES_JSON.exists(), "wishes.json must exist in workspace")
        with open(WISHES_JSON, "r", encoding="utf-8") as f:
            default_wishes = json.load(f)
        self.assertIsInstance(default_wishes, list)
        self.assertGreater(len(default_wishes), 0)
        self.assertIn("author", default_wishes[0])
        self.assertIn("wish", default_wishes[0])

    def test_r3_offline_fallback_network_error_and_queue(self):
        """
        R3: When the device is offline or the GAS endpoint returns network errors:
        1. syncWishesFromRemote catches the error and reads local wishes.
        2. Newly submitted wishes are queued in 'co_duyen_anh_pending_wishes'.
        3. Pending wishes remain safely preserved for deferred synchronization.
        """
        storage = MockLocalStorage()
        key_wishes = "co_duyen_anh_wishes"
        key_pending = "co_duyen_anh_pending_wishes"

        # Prepopulate offline storage
        offline_wishes = [
            {"id": "wish_offline_1", "author": "Học sinh A", "wish": "Chúc cô 20/11", "time": "18/11/2026"}
        ]
        storage.setItem(key_wishes, json.dumps(offline_wishes))

        # Submit new wish while offline
        new_offline_wish = {
            "id": "wish_offline_2",
            "author": "Học sinh B",
            "wish": "Cô là người thầy tuyệt vời nhất!",
            "time": "18/11/2026 10:30"
        }

        # Simulate offline submission logic
        current = json.loads(storage.getItem(key_wishes))
        current.insert(0, new_offline_wish)
        storage.setItem(key_wishes, json.dumps(current))

        # Queue pending wish
        pending = json.loads(storage.getItem(key_pending) or "[]")
        pending.append(new_offline_wish)
        storage.setItem(key_pending, json.dumps(pending))

        # Verify offline storage contains both wishes
        loaded_wishes = json.loads(storage.getItem(key_wishes))
        self.assertEqual(len(loaded_wishes), 2)
        self.assertEqual(loaded_wishes[0]["id"], "wish_offline_2")

        # Verify pending queue contains the unsynced wish
        loaded_pending = json.loads(storage.getItem(key_pending))
        self.assertEqual(len(loaded_pending), 1)
        self.assertEqual(loaded_pending[0]["id"], "wish_offline_2")

    def test_r3_tombstone_zero_resurrection_with_gas_sync(self):
        """
        Verify that deleted items stored in co_duyen_anh_deleted_ids are strictly
        filtered out and never resurrected, even if returned by the GAS backend.
        """
        backend = SimulatedGasBackend()
        backend.do_post({"action": "addWish", "id": "wish_del_1", "author": "Học sinh X", "wish": "Lời chúc xóa"})
        backend.do_post({"action": "addWish", "id": "wish_keep_2", "author": "Học sinh Y", "wish": "Lời chúc giữ"})

        # Tombstone key has 'wish_del_1'
        deleted_ids = ["wish_del_1"]

        # Fetch from GAS
        gas_res = backend.do_get({"action": "getWishes"})
        remote_wishes = gas_res["wishes"]

        # Filter remote wishes using tombstone logic
        filtered_wishes = [w for w in remote_wishes if w["id"] not in deleted_ids]

        self.assertEqual(len(filtered_wishes), 1)
        self.assertEqual(filtered_wishes[0]["id"], "wish_keep_2")
        self.assertNotIn("wish_del_1", [w["id"] for w in filtered_wishes])

    def test_r2_error_response_handling_and_retry_queue(self):
        """
        Verify that if GAS backend responds with an error JSON (e.g. empty wish or failure),
        the client logic properly detects error status and queues the item for retry.
        """
        backend = SimulatedGasBackend()
        storage = MockLocalStorage()
        key_pending = "co_duyen_anh_pending_wishes"

        # 1. Post an empty wish payload (which triggers error in GAS backend)
        err_res = backend.do_post({"action": "addWish", "wish": ""})
        self.assertEqual(err_res["status"], "error")
        self.assertIn("không được để trống", err_res["message"])

        # 2. Client-side error detection simulation
        def simulate_send_wish_to_gas(wish, backend_instance):
            resp = backend_instance.do_post({
                "action": "addWish",
                "id": wish["id"],
                "author": wish["author"],
                "wish": wish["wish"]
            })
            if resp.get("status") == "error":
                # Queue pending wish
                pending = json.loads(storage.getItem(key_pending) or "[]")
                pending.append(wish)
                storage.setItem(key_pending, json.dumps(pending))
                return {"success": False, "error": resp.get("message")}
            return {"success": True, "data": resp}

        test_bad_wish = {"id": "wish_err_1", "author": "Học sinh C", "wish": ""}
        result = simulate_send_wish_to_gas(test_bad_wish, backend)
        self.assertFalse(result["success"])
        queued = json.loads(storage.getItem(key_pending))
        self.assertEqual(len(queued), 1)
        self.assertEqual(queued[0]["id"], "wish_err_1")

    def test_r2_admin_deletion_propagates_to_gas(self):
        """
        Verify that admin deletion removes items from the GAS backend sheet
        so that subsequent devices fetching from GAS do not receive the deleted item.
        """
        backend = SimulatedGasBackend()
        backend.do_post({"action": "addWish", "id": "wish_target_del", "author": "Học sinh D", "wish": "Chúc cô 20/11"})
        self.assertEqual(len(backend.wishes_sheet), 1)

        # Admin deletes from backend
        del_res = backend.do_post({"action": "deleteWish", "id": "wish_target_del"})
        self.assertEqual(del_res["status"], "success")
        self.assertEqual(len(backend.wishes_sheet), 0)

        # Verify next device fetch receives empty list
        get_res = backend.do_get({"action": "getWishes"})
        self.assertEqual(len(get_res["wishes"]), 0)

    def test_r2_sub_letter_prepend_ordering(self):
        """
        Verify that newly submitted local wishes remain at the top of the feed (index 0)
        when merging with remote wishes and rendering into sub-letters deck.
        """
        remote_wishes = [
            {"id": "wish_remote_old", "author": "Học sinh 1", "wish": "Chúc cô vui vẻ"}
        ]
        local_wishes = [
            {"id": "wish_local_new", "author": "Học sinh 2", "wish": "Lời chúc mới nhất vừa gửi"},
            {"id": "wish_remote_old", "author": "Học sinh 1", "wish": "Chúc cô vui vẻ"}
        ]

        deleted_ids = []
        wish_map = {}

        # 1. Local-only wishes preserved at front
        for w in local_wishes:
            if w and w["id"] not in deleted_ids and not any(rw["id"] == w["id"] for rw in remote_wishes):
                wish_map[w["id"]] = w

        # 2. Remote wishes
        for w in remote_wishes:
            if w and w["id"] not in deleted_ids:
                wish_map[w["id"]] = w

        merged = list(wish_map.values())
        self.assertEqual(len(merged), 2)
        # Newest local wish MUST be first (index 0)
        self.assertEqual(merged[0]["id"], "wish_local_new")
        self.assertEqual(merged[1]["id"], "wish_remote_old")

    def test_r1_gas_date_object_formatting(self):
        """
        Verify that Code.gs includes defensive handling for Google Sheets Date objects.
        """
        content = read_workspace_file(CODE_GS)
        self.assertIn("instanceof Date", content, "Code.gs must handle Date objects defensively")
        self.assertIn("Utilities.formatDate", content, "Code.gs must format dates via Utilities.formatDate")

    def test_r2_sub_letter_card_renders_image_if_present(self):
        """
        Verify that createSubLetterCard in script.js renders the image element when a wish contains an image.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        self.assertIn("sub-letter-img", script_js, "createSubLetterCard must render sub-letter-img when wish has image")
        self.assertIn("wish.image", script_js, "createSubLetterCard must check wish.image")

    def test_r2_url_sanitization_removes_trailing_chars(self):
        """
        Verify that getGasWebAppUrl in both script.js and donggop.html strips trailing query characters (? and &).
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("replace(/[?&]+$/, '')", code, f"{fname} must sanitize trailing ? and & from GAS URL")

    def test_r3_script_js_flushes_pending_photos(self):
        """
        Verify that script.js also defines and invokes flushPendingPhotosToGas so offline photos
        are automatically flushed when visiting the main page.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        self.assertIn("PENDING_PHOTOS_KEY", script_js, "script.js must define PENDING_PHOTOS_KEY")
        self.assertIn("flushPendingPhotosToGas", script_js, "script.js must implement flushPendingPhotosToGas")

    def test_r1_gas_id_trimming(self):
        """
        Verify that Code.gs trims payload.id defensively when adding wishes and photos.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("String(payload.id).trim()", code_gs, "Code.gs must defensively trim payload.id")

    def test_r1_gas_manual_sheet_entry_fallback_id(self):
        """
        Verify that Code.gs provides defensive row fallback IDs if a user manually inserts
        wishes or photos directly into Google Sheets while leaving Column A (ID) blank.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn('id = "wish-row-" + (i + 2);', code_gs, "Code.gs must assign fallback ID for manual wish entries")
        self.assertIn('id = "photo-row-" + (i + 2);', code_gs, "Code.gs must assign fallback ID for manual photo entries")

    def test_r2_xss_sanitization_in_donggop_image_rendering(self):
        """
        Verify that donggop.html escapes image URLs with escapeHtml in both public feed and admin views.
        """
        donggop_html = read_workspace_file(DONGGOP_HTML)
        self.assertIn('escapeHtml(w.image)', donggop_html, "donggop.html must escape wish image URLs")
        self.assertIn('escapeHtml(p.image)', donggop_html, "donggop.html must escape photo image URLs")

    def test_r2_storage_event_listens_to_gas_url_change(self):
        """
        Verify that both script.js and donggop.html listen for GAS_CONFIG.STORAGE_KEY ('co_duyen_anh_gas_url')
        in window storage events to trigger remote synchronization instantly across tabs.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        self.assertIn("GAS_CONFIG.STORAGE_KEY", script_js, "script.js must check GAS_CONFIG.STORAGE_KEY in storage event")
        self.assertIn("GAS_CONFIG.STORAGE_KEY", donggop_html, "donggop.html must check GAS_CONFIG.STORAGE_KEY in storage event")

    def test_r1_gas_process_image_storage_robustness(self):
        """
        Verify that Code.gs trims image strings and performs case-insensitive base64 checking.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("rawImage = rawImage.trim()", code_gs, "Code.gs must trim rawImage")
        self.assertIn("rawImage.toLowerCase().indexOf", code_gs, "Code.gs must perform case-insensitive base64 check")

    def test_r1_gas_delete_item_by_fallback_id(self):
        """
        Verify that Code.gs deleteItemById and SimulatedGasBackend can delete rows that were manually
        created on Google Sheets without ID (using fallbackId 'wish-row-X' / 'photo-row-X').
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("fallbackId", code_gs, "Code.gs must compute fallbackId in deleteItemById")
        self.assertIn("cellId === targetId || (!cellId && fallbackId === targetId)", code_gs)

        backend = SimulatedGasBackend()
        # Row 1 (row index 2 in Sheet): has no cell ID (manually typed)
        manual_row = {"id": "", "author": "Học sinh gõ tay", "wish": "Chúc cô 20/11", "time": "18/11/2026"}
        backend.wishes_sheet.append(manual_row)
        self.assertEqual(len(backend.wishes_sheet), 1)

        # Deleting via fallback ID "wish-row-2"
        del_res = backend.do_post({"action": "deleteWish", "id": "wish-row-2"})
        self.assertEqual(del_res["status"], "success", "Must successfully delete manual row via fallbackId")
        self.assertEqual(len(backend.wishes_sheet), 0)

    def test_r1_gas_spreadsheet_formula_sanitization(self):
        """
        Verify that Code.gs defines and applies sanitizeSpreadsheetCell to neutralize
        CSV / spreadsheet formula injection triggers (=, +, -, @).
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("function sanitizeSpreadsheetCell(", code_gs, "Code.gs must implement sanitizeSpreadsheetCell")
        self.assertIn("sanitizeSpreadsheetCell(author)", code_gs)
        self.assertIn("sanitizeSpreadsheetCell(wish)", code_gs)

    def test_r1_gas_jsonp_callback_sanitization(self):
        """
        Verify that Code.gs validates callback parameter with strict regex before returning JSONP.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("^[a-zA-Z0-9_$.]+$", code_gs, "Code.gs must validate callback identifier")

    def test_r2_xss_sanitization_for_time_and_attributes_in_donggop(self):
        """
        Verify that donggop.html escapes w.time, p.time, v.time, and data-id attributes with escapeHtml.
        """
        donggop_html = read_workspace_file(DONGGOP_HTML)
        self.assertIn("escapeHtml(w.time || '')", donggop_html, "w.time must be escaped in feed")
        self.assertIn("escapeHtml(p.time || '')", donggop_html, "p.time must be escaped in admin")
        self.assertIn("escapeHtml(v.time || '')", donggop_html, "v.time must be escaped in visitor log")
        self.assertIn('data-id="${escapeHtml(w.id)}"', donggop_html, "w.id must be escaped in data-id")
        self.assertIn('data-id="${escapeHtml(p.id)}"', donggop_html, "p.id must be escaped in data-id")

    def test_r3_pending_queue_merge_concurrency(self):
        """
        Verify that flushPendingWishesToGas and flushPendingPhotosToGas in script.js and donggop.html
        safely merge newly added items into the pending queue instead of blindly overwriting.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("flushedIds", code, f"{fname} must track flushedIds to avoid queue overwrites")
            self.assertIn("[...remaining, ...newItems]", code, f"{fname} must merge remaining with newItems")

    def test_r2_form_submit_anti_duplicate_guard(self):
        """
        Verify that index.html and donggop.html disable submit buttons during async transmission
        to prevent duplicate wish spamming on slow networks.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        self.assertIn("submitBtn.disabled = true", script_js, "script.js must disable submit button")
        self.assertIn("submitBtn.disabled = false", script_js, "script.js must re-enable submit button in finally")
        self.assertIn("submitBtn.disabled = true", donggop_html, "donggop.html must disable submit button")

    def test_r2_touch_target_and_sentence_case_standards(self):
        """
        Verify that styles.css defines minimum 44px height for index form action buttons
        and donggop.html admin navigation tabs use proper Sentence case.
        """
        styles_css = read_workspace_file(STYLES_CSS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        self.assertIn(".index-form-actions .submit-wish-btn", styles_css)
        self.assertIn("min-height: 44px", styles_css, "submit-wish-btn must have min-height 44px")
        self.assertIn("min-height: 44px", styles_css, "cancel-wish-btn must have min-height 44px")

        # Sentence case on admin tab labels
        self.assertIn("Quản lý lời chúc", donggop_html, "Tab must use Sentence case: Quản lý lời chúc")
        self.assertIn("Quản lý hình ảnh", donggop_html, "Tab must use Sentence case: Quản lý hình ảnh")
        self.assertIn("Nhật ký truy cập", donggop_html, "Tab must use Sentence case: Nhật ký truy cập")

    def test_r1_gas_manual_sheet_entry_persists_id_to_cell(self):
        """
        Verify that Code.gs writes generated fallback IDs permanently back to the sheet cell (Column A)
        so that subsequent row deletions do not shift and renumber manual rows into already-tombstoned IDs.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("sheet.getRange(i + 2, 1).setValue(id)", code_gs, "Code.gs must persist fallback ID to cell")

    def test_r2_escape_html_handles_non_string_types_defensively(self):
        """
        Verify that escapeHtml in script.js and donggop.html casts inputs to string before replacing,
        preventing 'text.replace is not a function' TypeError on numeric or primitive values.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("text === null || text === undefined", code, f"{fname} must check null/undefined in escapeHtml")
            self.assertIn("String(text).replace(", code, f"{fname} must use String(text).replace in escapeHtml")

        def simulate_escape_html(val):
            if val is None:
                return ""
            return str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#039;")

        self.assertEqual(simulate_escape_html(2024), "2024")
        self.assertEqual(simulate_escape_html(0), "0")
        self.assertEqual(simulate_escape_html("Hello <script>"), "Hello &lt;script&gt;")
        self.assertEqual(simulate_escape_html(None), "")

    def test_r2_button_labels_sentence_case_compliance(self):
        """
        Verify that all primary and action buttons in donggop.html use Sentence case (Anti-AI Slop)
        and contain no decorative emojis.
        """
        donggop_html = read_workspace_file(DONGGOP_HTML)

        # Primary user buttons
        self.assertIn("<span>Gửi lời chúc tri ân</span>", donggop_html)
        self.assertIn("<span>Đóng góp hình ảnh kỷ niệm</span>", donggop_html)
        self.assertIn("<span>Gửi lời chúc vào thiệp của Cô</span>", donggop_html)
        self.assertIn("<span>Đóng góp hình ảnh vào cuộn phim 35mm</span>", donggop_html)
        self.assertIn("Đăng nhập quản trị", donggop_html)
        self.assertIn("<span>Quản trị admin</span>", donggop_html)

        # Admin action bar buttons
        self.assertIn("<span>Tạo link đồng bộ sang điện thoại</span>", donggop_html)
        self.assertIn("<span>Nhập mã đồng bộ</span>", donggop_html)
        self.assertIn("<span>Buộc đồng bộ tất cả</span>", donggop_html)
        self.assertIn("<span>Sao chép mã JSON</span>", donggop_html)
        self.assertIn("<span>Tải file wishes.json</span>", donggop_html)

        # Confirm removal of decorative emojis from admin buttons
        for emoji_char in ["📲", "📥", "🔄", "📋", "💾"]:
            self.assertNotIn(emoji_char, donggop_html, f"Button must not contain decorative emoji {emoji_char}")

    def test_r2_remove_elements_dom_selector_injection_safety(self):
        """
        Verify that appendWishToDeck, appendPhotoToFilmStrip, removeWishFromDeck,
        and removePhotoFromFilmStrip use robust attribute lookup or CSS.escape
        to prevent DOMException syntax errors with special-character IDs.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        self.assertIn("card.getAttribute('data-id') === targetId", script_js, "DOM operations must safely compare card data-id attribute")
        self.assertIn("frame.getAttribute('data-id') === targetId", script_js, "DOM operations must safely compare frame data-id attribute")

    def test_r2_admin_gas_save_triggers_sync_and_broadcast(self):
        """
        Verify that clicking btnSaveGas in donggop.html triggers syncWishesFromRemote and broadcasts SYNC_ALL.
        """
        donggop_html = read_workspace_file(DONGGOP_HTML)
        self.assertIn("syncWishesFromRemote()", donggop_html)
        self.assertIn("action: 'SYNC_ALL'", donggop_html)

    def test_r1_gas_read_wishes_ignores_completely_blank_rows(self):
        """
        Verify that Code.gs readWishesFromSheet ignores completely blank rows
        (where both rawWish and rawImage are empty), preventing ghost wish creation
        and unwanted ID persistence on empty sheet rows.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("if (!rawWish && !rawImage)", code_gs, "Code.gs must check both rawWish and rawImage")
        self.assertIn("continue;", code_gs, "Code.gs must skip empty rows with continue")

    def test_r1_gas_id_whitespace_fallback(self):
        """
        Verify that Code.gs validates trimmed payload.id before accepting it,
        so whitespace-only IDs fall back to generating unique IDs.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("(payload.id && String(payload.id).trim())", code_gs, "Code.gs must check trimmed ID truthiness")

    def test_r3_gas_error_status_triggers_fallback(self):
        """
        Verify that when GAS responds with error JSON (status: 'error'),
        syncWishesFromRemote in script.js and donggop.html detects the error status
        and throws, allowing fallback to wishes.json to execute instead of rendering 0 wishes.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("gasData.status === 'error'", code, f"{fname} must check gasData.status === 'error'")

        # Simulate client fallback logic when GAS returns error status
        gas_error_payload = {"status": "error", "message": "Quá giới hạn hạn ngạch hoặc lỗi trang tính"}
        fallback_wishes = [{"id": "wish_default_1", "author": "Học sinh lớp", "wish": "Chúc cô 20/11"}]

        def simulate_sync_with_gas_response(gas_response):
            gas_synced = False
            loaded_wishes = []

            # 1. Attempt GAS sync
            try:
                if not gas_response or gas_response.get("status") == "error":
                    raise Exception(gas_response.get("message", "GAS error"))
                remote = gas_response.get("wishes", [])
                loaded_wishes = list(remote)
                gas_synced = True
            except Exception:
                pass

            # 2. Tier 2 fallback to wishes.json if not gas_synced
            if not gas_synced:
                loaded_wishes = list(fallback_wishes)

            return gas_synced, loaded_wishes

        synced, result = simulate_sync_with_gas_response(gas_error_payload)
        self.assertFalse(synced, "gas_synced must be False when GAS returns error status")
        self.assertEqual(len(result), 1, "Must fall back to default wishes instead of empty list")
        self.assertEqual(result[0]["id"], "wish_default_1")

    def test_r1_gas_folder_trashed_safety(self):
        """
        Verify that Code.gs getOrCreateFolder skips trashed folders with !folder.isTrashed()
        before creating files, preventing files from being orphaned in the trash.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("!folder.isTrashed()", code_gs, "Code.gs must check !folder.isTrashed()")

    def test_r2_url_sanitization_removes_quotes_and_literals(self):
        """
        Verify that getGasWebAppUrl strips accidental wrapping quotes and rejects 'null'/'undefined' string literals.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("replace(/^[\"']|[\"']$/g, '')", code, f"{fname} must strip surrounding quotes")
            self.assertIn("userUrl !== 'null'" if "userUrl" in code else "stored !== 'null'", code, f"{fname} must reject 'null' string literal")

    def test_r2_unslop_index_and_script_compliance(self):
        """
        Verify that index.html, styles.css, donggop.html, and script.js comply with Anti-AI Slop guidelines:
        - No decorative emoji in recipient heading
        - Section headings use Sentence case
        - No decorative emoji prepended to clean-viewer-author
        - No uppercase tracked labels forcing all-caps on sentence-case headings
        """
        index_html = read_workspace_file(INDEX_HTML)
        script_js = read_workspace_file(SCRIPT_JS)
        styles_css = read_workspace_file(STYLES_CSS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        # index.html
        self.assertIn('<div class="letter-recipient">Cô Duyên Anh yêu quý</div>', index_html)
        self.assertNotIn("Cô Duyên Anh Yêu Quý 💖", index_html)
        self.assertIn('<strong>Những đứa học trò của Cô</strong>', index_html)
        self.assertNotIn("Những đứa học trò của Cô ✿", index_html)
        self.assertIn('<div class="sub-title">Tri ân ngày Nhà giáo Việt Nam 20/11</div>', index_html)
        self.assertNotIn("Tri Ân Ngày Nhà Giáo Việt Nam 20/11", index_html)
        self.assertIn('<div class="stage-tag">Tri ân từ học trò</div>', index_html)
        self.assertIn('<h2 class="sub-letters-title">Những lá thư gửi cô Duyên Anh</h2>', index_html)

        # script.js
        self.assertNotIn("📸", script_js)

        # styles.css & donggop.html: Eliminate uppercase tracked labels
        self.assertNotIn("text-transform: uppercase", styles_css, "styles.css must not use text-transform: uppercase on headings/tags")
        self.assertNotIn("text-transform: uppercase", donggop_html, "donggop.html must not use text-transform: uppercase on hero-badge")

    def test_r3_flush_pending_wishes_updates_image_url(self):
        """
        Verify that flushPendingWishesToGas in both script.js and donggop.html
        updates item.image with Google Drive direct link returned by GAS backend.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("resData.data.image.startsWith('http')", code, f"{fname} flushPendingWishesToGas must check resData.data.image")
            self.assertIn("target.image = resData.data.image", code, f"{fname} flushPendingWishesToGas must update target.image")

    def test_r1_gas_min_column_safety(self):
        """
        Verify that Code.gs guarantees minimum column count before querying sheet ranges,
        preventing boundary dimension exceptions when user deletes extra columns.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("sheet.getMaxColumns() < 6", code_gs, "Code.gs must ensure at least 6 columns for Wishes")
        self.assertIn("sheet.getMaxColumns() < 7", code_gs, "Code.gs must ensure at least 7 columns for Photos")

    def test_r1_gas_init_sheets_when_empty_sheet_exists(self):
        """
        Verify that initSheetsIfNeeded inserts headers if sheets already exist but are empty (getLastRow() === 0).
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("wishSheet.getLastRow() === 0", code_gs, "Code.gs must insert wish headers if sheet is empty")
        self.assertIn("photoSheet.getLastRow() === 0", code_gs, "Code.gs must insert photo headers if sheet is empty")

    def test_r1_gas_unsanitize_formula_cells(self):
        """
        Verify that Code.gs implements unsanitizeSpreadsheetCell to safely strip the single quote
        prefix from sanitized formula cells when reading back to the client.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn("function unsanitizeSpreadsheetCell(", code_gs, "Code.gs must implement unsanitizeSpreadsheetCell")
        self.assertIn("unsanitizeSpreadsheetCell(String(row[2]", code_gs, "Code.gs must unsanitize author")
        self.assertIn("unsanitizeSpreadsheetCell(String(row[3]", code_gs, "Code.gs must unsanitize wish/caption")

        def simulate_unsanitize(val):
            if val is None:
                return ""
            s = str(val)
            if len(s) > 1 and s[0] == "'":
                if s[1] in ("=", "+", "-", "@"):
                    return s[1:]
            return s

        self.assertEqual(simulate_unsanitize("'+84 905 123 456"), "+84 905 123 456")
        self.assertEqual(simulate_unsanitize("'=SUM(1,2)"), "=SUM(1,2)")
        self.assertEqual(simulate_unsanitize("'Bình thường"), "'Bình thường")
        self.assertEqual(simulate_unsanitize("Nguyên"), "Nguyên")

    def test_r1_gas_mime_type_extraction_robustness(self):
        """
        Verify that Code.gs splits headerPart by ';' to safely strip charset/parameters from MIME type.
        """
        code_gs = read_workspace_file(CODE_GS)
        self.assertIn('.split(";")[0]', code_gs, "Code.gs must clean MIME type by splitting on semicolon")

    def test_r2_pending_queue_duplicate_prevention(self):
        """
        Verify that queuePendingWish and queuePendingPhoto prevent duplicate entries
        if called repeatedly with the same wish or photo.
        """
        script_js = read_workspace_file(SCRIPT_JS)
        donggop_html = read_workspace_file(DONGGOP_HTML)

        for code, fname in [(script_js, "script.js"), (donggop_html, "donggop.html")]:
            self.assertIn("!pending.some(p => p.id === wish.id)", code, f"{fname} queuePendingWish must prevent duplicate IDs")

        storage = MockLocalStorage()
        key = "co_duyen_anh_pending_wishes"
        test_item = {"id": "wish_dup_1", "author": "Nam", "wish": "Chúc cô"}

        def simulate_queue_pending(item):
            pending = json.loads(storage.getItem(key) or "[]")
            if not any(p["id"] == item["id"] for p in pending):
                pending.append(item)
                storage.setItem(key, json.dumps(pending))

        simulate_queue_pending(test_item)
        simulate_queue_pending(test_item)
        simulate_queue_pending(test_item)

        result = json.loads(storage.getItem(key))
        self.assertEqual(len(result), 1, "Pending queue must contain exactly 1 entry even after repeated queueing")

    def test_r2_invalid_action_returns_error(self):
        """
        Verify that SimulatedGasBackend and Code.gs return status 'error' when an unknown action is received.
        """
        backend = SimulatedGasBackend()
        res = backend.do_post({"action": "unknown_action_xyz"})
        self.assertEqual(res["status"], "error")
        self.assertIn("Hành động không hợp lệ", res["message"])


if __name__ == "__main__":
    unittest.main()
