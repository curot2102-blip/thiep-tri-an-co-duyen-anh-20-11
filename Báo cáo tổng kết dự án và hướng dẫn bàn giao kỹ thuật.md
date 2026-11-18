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

### Giai đoạn 5 (Progress 0.44 -> 0.78): Đại thước phim 35mm
- **Thước phim điện ảnh 35mm**:
  - Gồm toàn bộ ảnh kỷ yếu và ảnh đời thường đẹp nhất của Cô (chuẩn WebP siêu nhẹ).
  - **Tối ưu độ dài chính xác**: Cuộn phim tự động co giãn theo số lượng ảnh thực tế, chỉ dài ngang tấm ảnh cuối cùng, loại bỏ hoàn toàn khoảng trống đen dư thừa sau ảnh cuối.
  - **Tối ưu hóa GPU di động (GPU Culling & Content-Visibility)**: Bổ sung `visibility: hidden` khi ngoài phạm vi Stage 5 để giải phóng hoàn toàn bộ nhớ đệm GPU trên điện thoại. Áp dụng `content-visibility: auto; contain: layout paint;` trên từng khung phim giúp trình duyệt chỉ render các khung ảnh đang nằm trong tầm nhìn.
  - **Hỗ trợ cảm ứng di động**: Bổ sung `touchstart` và `touchmove` phân biệt chính xác giữa cuộn vuốt màn hình và chạm nhẹ mở ảnh phóng to.
  - Khung ảnh giữ nguyên vị trí ổn định, không scale phóng to hay phát âm thanh khi di chuột qua; chỉ mở xem ảnh chi tiết khi người dùng chủ động nhấn tĩnh vào ảnh.
  - Hai hàng răng cưa lặp lại thông tin bản quyền phim Kodak Vision3 & Eastman Film.
  - **Ảnh đóng góp mới**: Tự động nối tiếp vào cuối dải phim theo đúng tỉ lệ khung hình và gắn chính **TÊN NGƯỜI ĐÓNG GÓP** trực tiếp trên khung viền phim (qua thẻ `.frame-contributor-tag`).
  - Khung xem ảnh toàn màn hình `#clean-image-viewer` hiển thị chi tiết tên người gửi và thời gian gửi.

### Giai đoạn 6 (Progress 0.75 -> 0.91): Phân đoạn Các lá thư con mở sẵn xếp tầng (`#sub-letters-stage`)
- Nằm ngay sau cuộn phim 35mm và trước giai đoạn thả tim.
- Các lá thư con hiển thị ở trạng thái **mở sẵn dưới dạng danh sách thiệp giấy xếp tầng trang trọng** (đồng bộ nền giấy kem, viền chỉ vàng chìm của bức tâm thư chính).
- Tự động co giãn theo độ dài lời chúc, trình bày đầy đủ tên người gửi và nội dung để người đọc lướt đọc trực tiếp.
- Tích hợp hiệu ứng âm thanh mở giấy `playPaperRustle()` kết hợp chuông gió êm dịu khi chạm tương tác.

### Giai đoạn 7 (Progress 0.88 -> 1.00): Nút thả tim & Điều hướng
- **Nút thả tim (`#heart-btn`)**: Lưu trữ số tim thực tế vào `localStorage` (`co_duyen_anh_hearts`), phát tín hiệu `UPDATE_HEARTS` qua `BroadcastChannel` tức thì (< 1ms) sang mọi tab, bung nở hoa tim bay rực rỡ và tự động đồng bộ ngầm lên Google Sheets.
- **Nút cuộn về đầu trang mượt mà (`#replay-btn`)**.
- **Điều hướng 1 tab duy nhất**: Loại bỏ hoàn toàn `target="_blank"`. Các nút *"Viết lời chúc gửi Cô"*, *"Thêm ảnh vào cuộn phim"* và *"Xem album ảnh 35mm"* hoạt động mượt mà trong cùng một tab.

---

## 4. Hệ thống trang đóng góp & quản trị viên (donggop.html)
- **Phân tách 2 mục độc lập hoàn toàn**:
  1. **Mục 1 - Gửi Lời Chúc Tri Ân**: Chỉ nhập tên và lời chúc tâm tình, gửi riêng rẽ không cần kèm ảnh.
  2. **Mục 2 - Đóng Góp Hình Ảnh Kỷ Niệm**: Hỗ trợ chọn và tải lên nhiều ảnh cùng lúc, có lưới xem trước (preview grid) kèm nút xóa ảnh, tự động nén Canvas sang WebP (chất lượng 0.80, tối đa 1200px) trước khi lưu.
  3. Dòng lưu ý bắt buộc: *"Vui lòng nhập họ và tên thật, nếu không sẽ không được duyệt"*.
- **Đồng bộ thời gian thực liên tục (Real-time BroadcastChannel Sync)**:
  - Sử dụng kênh `BroadcastChannel('co_duyen_anh_sync_channel')` kết hợp sự kiện `storage`.
  - Mọi thao tác gửi lời chúc mới, gửi ảnh mới, thả tim, xóa dữ liệu hoặc đặt lại về ban đầu từ Admin trên `donggop.html` sẽ lập tức cập nhật tức thì (< 1ms) sang `index.html` và `album.html` đang mở mà không cần tải lại trang (F5).
- **Bảng điều khiển Quản trị viên (Admin Portal)**:
  - Mở bằng mật khẩu: `trannguyen21022008trian`.
  - **Thống kê 4 chỉ số**: Lời chúc, Ảnh kỷ niệm, Lượt vào, Lượt tim (`stat-hearts`).
  - **Công cụ Admin nâng cao**:
    + Nút `Đặt lại lượt tim về 0`: Đưa số tim trên toàn bộ hệ thống về 0.
    + Nút `Đặt lại về ban đầu`: Xóa toàn bộ dữ liệu thử nghiệm, khôi phục lời chúc mặc định từ `wishes.json`, xóa danh sách ảnh đóng góp và đưa tim về 0 trên toàn bộ các tab và Google Sheets.
  - Chia làm **2 Tab riêng biệt**:
    + **Tab 1 - Quản lý Lời chúc**: Xem chi tiết, xóa từng lời chúc.
    + **Tab 2 - Quản lý Hình ảnh**: Xem ảnh phóng to, thông tin người gửi, xóa ảnh lỗi.
  - Tích hợp cơ chế **Tombstone** (`co_duyen_anh_deleted_ids`) đảm bảo dữ liệu đã xóa không bao giờ bị tự sinh lại.

---

## 5. Trang Album Ảnh Kỷ Niệm 35mm Riêng Biệt (album.html)
- **Thiết kế phong cách hoài niệm cổ điển**: 
  - Giao diện phòng tối rọi phim (Darkroom Contact Sheet) kết hợp tông màu than ấm và vàng hổ phách Kodak (`#f59e0b`).
  - Toàn bộ ảnh đóng góp từ học sinh được sắp xếp dưới dạng **Lưới ô ảnh tĩnh chia ngăn (Grid layout)**, không dùng hiệu ứng cuộn trượt ngang phức tạp, mang lại trải nghiệm hoài niệm, tĩnh lặng và trang trọng.
  - Trên điện thoại di động (`@media (max-width: 768px)`), album tự động chuyển sang dạng **ô lưới 2 cột song song** (`grid-template-columns: repeat(2, minmax(0, 1fr))`) sắc nét và vừa vặn.
  - Mỗi khung hình mô phỏng chính xác dải phim 35mm với dải răng cưa `KODAK 500T`, `EASTMAN SAFETY FILM` và số thứ tự phim `01A`, `02A`,...
- **Bảng thông tin người đăng chi tiết (Metadata Plate)**:
  - Tên học sinh đóng góp (icon người gửi), thời gian đăng và lời nhắn tâm tình trích dẫn trang nhã dưới từng tấm hình.
- **Tính năng tìm kiếm & Phóng to (Lightbox)**:
  - Thanh tìm kiếm tức thời theo tên bạn gửi hoặc nội dung chú thích.
  - Chạm vào bất kỳ khung phim nào để mở cửa sổ phóng to toàn màn hình với đầy đủ chi tiết kỷ niệm.
- **Đồng bộ thời gian thực 2 chiều**:
  - Tự động nạp trực tiếp danh sách ảnh từ Google Sheets và bộ nhớ cục bộ.
  - Lắng nghe `BroadcastChannel` để cập nhật tức thì ngay khi có bạn học trò mới đăng ảnh từ trang `donggop.html`.

---

## 6. Bảng tra cứu các tệp quan trọng
| Tên tệp | Vai trò |
| :--- | :--- |
| [index.html](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/index.html) | Cấu trúc HTML chính chứa toàn bộ timeline, cuộn phim 35mm, phân đoạn lá thư con mở sẵn `#sub-letters-stage`, viewer phóng to. |
| [styles.css](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/styles.css) | Giao diện chuẩn Anti-AI Slop, phong bì 3D, thước phim 35mm, thiệp giấy xếp tầng, hỗ trợ `100dvh` và touch target 44px. |
| [script.js](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/script.js) | Động cơ cuộn trang Antigravity 60fps, âm thanh Web Audio API, render ảnh WebP, lắng nghe BroadcastChannel đồng bộ dữ liệu. |
| [donggop.html](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/donggop.html) | Trang đóng góp tách riêng 2 form, tự động nén Canvas WebP, Admin Portal 2 tab, thống kê 4 thẻ và phát tín hiệu BroadcastChannel. |
| [album.html](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/album.html) | Trang album ảnh kỷ niệm 35mm độc lập (lưới 2 cột di động, metadata tấm phim, lightbox). |
| [wishes.json](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/wishes.json) | Tệp dữ liệu khởi tạo các lời chúc ban đầu và khôi phục khi reset về mặc định. |
| [images/](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/images/) | Chứa toàn bộ ảnh kỷ niệm và meme đã chuyển đổi sang định dạng `.webp` siêu nhẹ (tiết kiệm 94.9% dung lượng). |
| [Code.gs](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/Code.gs) | Mã nguồn Google Apps Script backend xử lý lưu trữ, truy xuất dữ liệu Google Sheets, quản lý tim và tối ưu ảnh lên Google Drive. |
| [tests/run_tests.py](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/tests/run_tests.py) | Bộ chạy kiểm thử tự động toàn hệ thống (77 tests qua 5 Tier đạt 100% PASS). |

---

## 7. Lịch sử các bản cập nhật gần nhất
- `19/11/2026`: Tối ưu hóa chuyên sâu Giai đoạn 5 (GPU visibility culling, content-visibility, cảm ứng chạm di động), điều hướng 1 tab duy nhất (gỡ bỏ hoàn toàn target="_blank"), đồng bộ lượt thả tim tức thì qua BroadcastChannel (< 1ms), thêm thẻ thống kê lượt tim trong Admin Dashboard, chuyển đổi Album ảnh trên di động sang dạng ô lưới 2 cột cổ điển, toàn bộ 77/77 bài kiểm thử E2E tự động qua 5 Tier đạt 100% PASS.
- `18/11/2026`: Bổ sung công cụ Quản trị viên `btn-reset-default` ("Đặt lại về ban đầu"), dọn dẹp dữ liệu thử nghiệm, khôi phục lời chúc mặc định, đưa tim về 0 và phát tín hiệu đồng bộ toàn hệ thống.
- `18/11/2026`: Thiết kế và triển khai trang Album ảnh kỷ niệm 35mm riêng biệt `album.html` (phong cách Darkroom Contact Sheet).
- `18/11/2026`: Tối ưu hóa hiệu năng di động cực hạn (gỡ bỏ background-attachment fixed, cache scrollWidth, translate3d GPU, async decoding).
- `18/11/2026`: Triển khai thành công kết nối Google Apps Script & Google Sheets làm backend đồng bộ hóa thời gian thực, có cơ chế Offline Fallback 3 tầng bền bỉ, toàn bộ các bài kiểm thử E2E tự động qua 5 Tier đạt 100% PASS.

---
*Tài liệu này được biên soạn để đảm bảo tính liên tục 100% cho mọi phiên làm việc tiếp theo.*
