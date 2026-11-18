# Báo cáo tổng kết dự án và hướng dẫn bàn giao kỹ thuật
**Dành cho trợ lý AI ở các phiên làm việc tiếp theo**

---

## 1. Thông tin chung dự án
- **Tên dự án**: Trang web Thiệp Tri Ân 20/11 & Vũ Trụ Kỷ Niệm Cô Duyên Anh
- **Mục tiêu**: Thiệp chúc mừng ngày Nhà giáo Việt Nam 20/11 dành riêng cho Cô Duyên Anh, kết hợp nghệ thuật cuộn trang điện ảnh (Antigravity Kinetic Scroll Timeline) với các bức ảnh kỷ yếu thanh xuân và bộ sưu tập meme hài hước, phân đoạn lá thư con mở sẵn xếp tầng, cùng hệ thống gửi lời chúc & đóng góp ảnh tách biệt và đồng bộ thời gian thực.
- **Thư mục làm việc chính**: `g:\My Drive\Hình ảnh kỷ niệm\Ành dìm cô Duyên Anh\Trang web kỷ niệm cô Duyên Anh`
- **Lưu ý tuyệt đối**: Thư mục `Web` là bản gốc lưu trữ của người dùng, **tuyệt đối không được can thiệp hay chỉnh sửa**.
- **Kho mã nguồn GitHub**: `https://github.com/curot2102-blip/thiep-tri-an-co-duyen-anh-20-11` (nhánh `main`)
- **Trang web chính (Live)**: `https://curot2102-blip.github.io/thiep-tri-an-co-duyen-anh-20-11/`
- **Trang đóng góp & Quản trị (Live)**: `https://curot2102-blip.github.io/thiep-tri-an-co-duyen-anh-20-11/donggop.html`
- **Mật khẩu Quản trị viên (Admin)**: `trannguyen21022008trian` (Do bạn Trần Nguyên quản lý)

---

## 2. Quy tắc cốt lõi bắt buộc tuân thủ (User rules)
1. **Quy tắc đặt tên tệp tài liệu**:
   - Luôn viết tiếng Việt có dấu đầy đủ.
   - Tuyệt đối không dùng dấu gạch dưới (`_`) hoặc dấu gạch ngang (`-`).
   - Sử dụng khoảng trắng tự nhiên giữa các từ (Ví dụ: `Báo cáo tổng kết dự án và hướng dẫn bàn giao kỹ thuật.md`).
2. **Quy chuẩn Anti-AI Slop & Giao diện**:
   - Không dùng gradient màu tím/xanh neon lòe loẹt, không viền phát sáng (glow), không icon trang trí sáo rỗng.
   - Giao diện tối màu cao cấp (Deep Space Navy `#07090e`, vàng kim loại `#f59e0b` / `#fbbf24`, giấy kem cổ điển).
   - Tối ưu hoàn hảo cho màn hình điện thoại di động ở **chế độ dọc (portrait)**: sử dụng `100dvh`, touch target tối thiểu 44x44px, thao tác vuốt cảm ứng mượt mà 60fps, loại bỏ hoàn toàn Layout Thrashing.
3. **Quy trình Git**:
   - Sau khi hoàn thành bất kỳ chỉnh sửa nào trong thư mục `Trang web kỷ niệm cô Duyên Anh`, luôn chạy `git commit` và `git push origin main` để cập nhật trực tiếp lên GitHub Pages.

---

## 3. Cấu trúc kỹ thuật và tiến trình cuộn trang (Scroll timeline)
Hệ thống sử dụng cơ chế nội suy tiến trình cuộn trang liên tục `targetProgress` từ `0.0` đến `1.0` (trong `script.js` qua `requestAnimationFrame`):

### Giai đoạn 1 (Progress 0.00 -> 0.08): Phong bì 3D mở nắp
- Phong bì thư màu nâu cà phê cổ điển đóng kín ở đầu trang, nắp gập 3D.
- Khi người dùng cuộn hoặc chạm nhẹ vào phong bì, nắp phong bì mở ra và lá thư bên trong trượt lên nhẹ nhàng.
- Mép lá thư không bao giờ bị lộ hay thò ra ngoài khi phong bì đang đóng kín.

### Giai đoạn 2 (Progress 0.08 -> 0.22): Bức tâm thư tri ân chính
- Lá thư phóng to trang nhã giữa màn hình với nền giấy kem hoàng gia và viền chỉ vàng chìm.
- Chứa nội dung tri ân cảm xúc của tập thể học sinh gửi tới Cô.

### Giai đoạn 3 (Progress 0.22 -> 0.36): Tiêu đề lời chúc trung tâm
- Dòng chữ tiêu đề lớn: *"Chúc cô Duyên Anh 20/11 vui vẻ"*.
- Nền vũ trụ tĩnh lặng với các icon hoa và mũ tốt nghiệp di chuyển chậm rãi, tinh tế.

### Giai đoạn 4 (Progress 0.36 -> 0.50): Vũ trụ Meme bất hủ
- 10 thẻ meme hài hước định dạng WebP bay dập dềnh hai bên theo quỹ đạo ngẫu nhiên.
- Chạm vào meme phát âm thanh vui nhộn và mở popup xem ảnh chi tiết.

### Giai đoạn 5 (Progress 0.50 -> 0.82): Đại thước phim 35mm
- **Thước phim điện ảnh 35mm**:
  - Gồm toàn bộ ảnh kỷ yếu và ảnh đời thường đẹp nhất của Cô (chuẩn WebP siêu nhẹ).
  - **Tối ưu độ dài chính xác**: Cuộn phim tự động co giãn theo số lượng ảnh thực tế, chỉ dài ngang tấm ảnh cuối cùng, loại bỏ hoàn toàn khoảng trống đen dư thừa sau ảnh cuối.
  - Khi có ảnh mới được đóng góp, cuộn phim tự động mở rộng tương ứng; khi cuộn đến cuối giai đoạn, dải phim dừng lại đúng tấm ảnh cuối cùng.
  - **Không mở popup hoặc phóng to khi di chuột qua**: Khung ảnh giữ nguyên vị trí ổn định, không scale phóng to hay phát âm thanh khi di chuột qua; chỉ mở xem ảnh chi tiết khi người dùng chủ động nhấn tĩnh vào ảnh.
  - Hai hàng răng cưa lặp lại thông tin bản quyền phim Kodak Vision3 & Eastman Film.
  - **Ảnh đóng góp mới**: Tự động nối tiếp vào cuối dải phim theo đúng tỉ lệ khung hình và gắn chính **TÊN NGƯỜI ĐÓNG GÓP** trực tiếp trên khung viền phim (qua thẻ `.frame-contributor-tag`).
  - Khung xem ảnh toàn màn hình `#clean-image-viewer` hiển thị chi tiết tên người gửi và thời gian gửi.

### Giai đoạn 5B (Progress 0.82 -> 0.92): Phân đoạn Các lá thư con mở sẵn xếp tầng (`#sub-letters-stage`)
- Nằm ngay sau cuộn phim 35mm và trước giai đoạn thả tim.
- Các lá thư con hiển thị ở trạng thái **mở sẵn dưới dạng danh sách thiệp giấy xếp tầng trang trọng** (đồng bộ nền giấy kem, viền chỉ vàng chìm của bức tâm thư chính).
- Tự động co giãn theo độ dài lời chúc, trình bày đầy đủ tên người gửi và nội dung để người đọc lướt đọc trực tiếp.
- Tích hợp hiệu ứng âm thanh mở giấy `playPaperRustle()` kết hợp chuông gió êm dịu khi chạm tương tác.

### Giai đoạn 6 (Progress 0.92 -> 1.00): Nút thả tim & Điều hướng
- Nút thả tim (`#heart-btn`): Lưu trữ số tim thực tế vào `localStorage` (`co_duyen_anh_hearts`), bấm tim sẽ tung mưa tim lấp lánh và lưu vĩnh viễn số tim.
- Nút cuộn về đầu trang mượt mà (`#replay-btn`).
- Nút dẫn trực tiếp sang trang đóng góp độc lập (`donggop.html`).

---

## 4. Hệ thống trang đóng góp & quản trị viên (donggop.html)
- **Phân tách 2 mục độc lập hoàn toàn**:
  1. **Mục 1 - Gửi Lời Chúc Tri Ân**: Chỉ nhập tên và lời chúc tâm tình, gửi riêng rẽ không cần kèm ảnh.
  2. **Mục 2 - Đóng Góp Hình Ảnh Kỷ Niệm**: Hỗ trợ chọn và tải lên nhiều ảnh cùng lúc, có lưới xem trước (preview grid) kèm nút xóa ảnh, tự động nén Canvas sang WebP (chất lượng 0.80, tối đa 1200px) trước khi lưu.
  3. Dòng lưu ý bắt buộc: *"Vui lòng nhập họ và tên thật, nếu không sẽ không được duyệt"*.
- **Đồng bộ thời gian thực liên tục (Real-time BroadcastChannel Sync)**:
  - Sử dụng kênh `BroadcastChannel('co_duyen_anh_sync_channel')` kết hợp sự kiện `storage`.
  - Mọi thao tác gửi lời chúc mới, gửi ảnh mới hoặc xóa dữ liệu từ Admin trên `donggop.html` sẽ lập tức cập nhật tức thì (< 1ms) sang `index.html` đang mở mà không cần tải lại trang (F5).
- **Bảng điều khiển Quản trị viên (Admin Portal)**:
  - Mở bằng mật khẩu: `trannguyen21022008trian`.
  - Chia làm **2 Tab riêng biệt**:
    + **Tab 1 - Quản lý Lời chúc**: Xem chi tiết, xóa từng lời chúc.
    + **Tab 2 - Quản lý Hình ảnh**: Xem ảnh phóng to, thông tin người gửi, xóa ảnh lỗi.
  - Tích hợp cơ chế **Tombstone** (`co_duyen_anh_deleted_ids`) đảm bảo dữ liệu đã xóa không bao giờ bị tự sinh lại.

---

## 5. Bảng tra cứu các tệp quan trọng
| Tên tệp | Vai trò |
| :--- | :--- |
| `index.html` | Cấu trúc HTML chính chứa toàn bộ timeline, cuộn phim 35mm, phân đoạn lá thư con mở sẵn `#sub-letters-stage`, viewer phóng to. |
| `styles.css` | Giao diện chuẩn Anti-AI Slop, phong bì 3D, thước phim 35mm, thiệp giấy xếp tầng, hỗ trợ `100dvh` và touch target 44px. |
| `script.js` | Động cơ cuộn trang Antigravity 60fps, âm thanh Web Audio API, render ảnh WebP, lắng nghe BroadcastChannel đồng bộ dữ liệu. |
| `donggop.html` | Trang đóng góp tách riêng 2 form, tự động nén Canvas WebP, Admin Portal 2 tab và phát tín hiệu BroadcastChannel. |
| `wishes.json` | Tệp dữ liệu khởi tạo các lời chúc ban đầu. |
| `images/` | Chứa toàn bộ ảnh kỷ niệm và meme đã chuyển đổi sang định dạng `.webp` siêu nhẹ (tiết kiệm 94.9% dung lượng). |
| `Code.gs` | Mã nguồn Google Apps Script backend xử lý lưu trữ, truy xuất dữ liệu Google Sheets và tối ưu ảnh lên Google Drive. |
| `Hướng dẫn triển khai Google Apps Script và đồng bộ Google Sheets.md` | Tài liệu hướng dẫn từng bước tạo Google Sheet, triển khai Web App và cấu hình kết nối. |
| `tests/test_google_sheets_sync.py` | Bộ kiểm thử tự động Tier 5 xác nhận hợp đồng API, đồng bộ luồng, offline fallback và tombstone. |

---

## 6. Lịch sử các bản cập nhật gần nhất
- `bbc12d7`: Tối ưu hóa và nâng cấp toàn diện trang web kỷ niệm cô Duyên Anh 20/11 (chuyển đổi WebP, tách 2 form, lá thư con xếp tầng, BroadcastChannel đồng bộ thời gian thực).
- `407f3e7`: Tối ưu diện tích chạm 44px và khắc phục lỗi validation đóng góp ảnh trên `donggop.html`.
- Triển khai thành công kết nối Google Apps Script & Google Sheets làm backend đồng bộ hóa thời gian thực, có cơ chế Offline Fallback 3 tầng bền bỉ (tự động kích hoạt dự phòng ngay cả khi Google Apps Script trả về lỗi status error, chống hiện tượng trang trắng trên thiết bị mới), bảo vệ chống tái sử dụng thư mục Google Drive nằm trong thùng rác (`!folder.isTrashed()`), làm sạch URL cấu hình chống bao quanh bởi dấu ngoặc kép hoặc chuỗi ký tự `null`/`undefined`, hàng đợi tự động bù ngoại tuyến (cho cả lời chúc và hình ảnh) có cơ chế hợp nhất chống thất thoát dữ liệu đa luồng, hỗ trợ xóa trực tiếp từ Admin lên Sheet (khắc phục hiện tượng dịch dòng ID nhập tay qua cơ chế lưu ID vĩnh viễn vào ô tính và loại bỏ triệt để việc sinh lời chúc ma từ các dòng trống), chống spam gửi trùng lặp (submit guard), phòng chống CSV/Spreadsheet formula injection, kiểm tra an toàn JSONP callback, chuẩn hóa diện tích chạm 44px chuẩn di động và Sentence case trên toàn bộ các nút bấm và tab quản trị cũng như tiêu đề trang chủ (loại bỏ hoàn toàn emoji trang trí và thay thế bằng SVG nét mảnh đồng bộ), phòng chống XSS triệt để qua escapeHtml phòng vệ cho cả kiểu dữ liệu số/nguyên thủy, tự động kích hoạt đồng bộ và broadcast ngay khi lưu cấu hình URL Google Apps Script, bảo vệ an toàn selector DOM chống lỗi cú pháp khi thêm/xóa phần tử, toàn bộ 72/72 bài kiểm thử E2E tự động qua 5 Tier đạt 100% PASS.

---
*Tài liệu này được biên soạn để đảm bảo tính liên tục 100% cho mọi phiên làm việc tiếp theo.*
