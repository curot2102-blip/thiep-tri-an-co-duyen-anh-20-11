# BÁO CÁO TỔNG KẾT TOÀN DIỆN DỰ ÁN & HỒ SƠ CHUYỂN GIAO PHIÊN MỚI
**Dự án**: Trang web Thiệp Tri Ân 20/11 & Vũ Trụ Kỷ Niệm Cô Duyên Anh  
**Thời điểm tổng kết**: 18/11/2026  
**Kho lưu trữ GitHub**: `https://github.com/curot2102-blip/thiep-tri-an-co-duyen-anh-20-11` (Nhánh `main` - GitHub Pages)  
**Thư mục làm việc**: `g:\My Drive\Hình ảnh kỷ niệm\Ành dìm cô Duyên Anh\Trang web kỷ niệm cô Duyên Anh`  

---

## I. TỔNG QUAN DỰ ÁN & HIỆN TRẠNG KỸ THUẬT

Trang web là sản phẩm thiệp tri ân điện tử kết hợp trải nghiệm cuộn scrollytelling tương tác 3D đa giai đoạn, được thiết kế chuyên biệt cho dịp 20/11 tri ân cô Duyên Anh. Toàn bộ mã nguồn tuân thủ tiêu chuẩn giao diện chuyên nghiệp (Anti-AI Slop), tương thích mượt mà trên cả máy tính và điện thoại thông minh theo định dạng dọc.

```mermaid
flowchart TD
    Client1["📱 Điện thoại học sinh"] -->|Gửi lời chúc / ảnh / thả tim| GAS["⚡ Google Apps Script Web App"]
    Client2["💻 Máy tính Quản trị viên"] -->|Xóa lời chúc / quản lý| GAS
    Client3["👩‍🏫 Máy tính Cô Duyên Anh"] -->|Đọc lời chúc / ngắm ảnh| GAS
    
    GAS <-->|Lưu trữ văn bản & lượt tim| GS["📊 Google Sheets (Wishes, Photos, Hearts)"]
    GAS <-->|Lưu trữ ảnh gốc Base64| GD["📁 Google Drive Folder"]
    
    GAS -->|Đồng bộ tức thì| Client1
    GAS -->|Đồng bộ tức thì| Client2
    GAS -->|Đồng bộ tức thì| Client3
    
    subgraph OfflineFallback ["🛡️ Cơ chế dự phòng ngoại tuyến 3 tầng"]
        LocalStore["💾 Trình duyệt LocalStorage"]
        StaticJson["📄 Tệp tĩnh wishes.json trên GitHub"]
    end
    Client1 -.->|Khi mất mạng| OfflineFallback
```

---

## II. DANH MỤC CÁC TÍNH NĂNG ĐÃ HOÀN TẤT TRIỆT ĐỂ

### 1. Trải nghiệm thị giác & Cuộn Scrollytelling 3D
- **Giai đoạn 1 & 2 (Phong bì & Lá thư)**:
  - Khắc phục hoàn toàn lỗi lá thư bị lộ ở đầu trang: lá thư được giấu kín 100% bên trong phong bì khi scroll $p \le 0.045$, chỉ trượt nhô lên khi nắp phong bì mở ra và bung mở hiệu ứng 3D khi $p > 0.085$.
  - Chuyển động cuộn mượt mà, chuyển cảnh êm ái giữa các phân đoạn.
- **Giai đoạn 5 (Cuộn phim Kỷ yếu 35mm)**:
  - Loại bỏ hoàn toàn khoảng đen dư thừa cuối cuộn phim ($1443\text{px}$), cuộn phim tự động ôm sát chính xác mép khung ảnh cuối cùng.
  - Phân tích thị giác bằng thuật toán Normalized Cross-Correlation, **đã loại bỏ 5 bức ảnh chụp liên thanh trùng lặp**. Hiện cuộn phim có đúng **26 khung hình độc nhất vô nhị** được đánh số liền mạch từ `01A` đến `26A`.
  - Đã chuyển đổi 100% tài nguyên ảnh sang định dạng `.webp` thế hệ mới, tối ưu tốc độ tải trang cực nhanh.
  - Khung ảnh đóng góp mới từ học sinh tự động gắn nối tiếp vào dải phim 35mm kèm nhãn người gửi.
- **Giai đoạn 6 (Các lá thư con tri ân xếp tầng)**:
  - Hiển thị trang trọng ngay bên dưới cuộn phim 35mm, tự động tải và hiển thị danh sách lời chúc từ mọi học sinh.

### 2. Hệ thống Backend Đám Mây Google Sheets & Google Drive
- **Mã nguồn `Code.gs`**:
  - Xử lý nhận dữ liệu (`doPost`) và nạp dữ liệu (`doGet`) chuẩn CORS.
  - Tự động tạo và quản lý 3 trang tính: `Wishes` (lời chúc), `Photos` (ảnh đóng góp), `Hearts` (lượt thả tim).
  - Tự động nén và tải ảnh Base64 lên thư mục Google Drive riêng, lưu lại URL trực tiếp để không làm tràn giới hạn ô tính của Google Sheets.
  - Phòng chống Formula Injection và bảo vệ dữ liệu.
- **Cấu hình trực tiếp trên Web**:
  - Đã cấu hình trực tiếp URL Web App của người dùng (`https://script.google.com/macros/s/AKfycbwUrK7M8gtsRfLzXoyTBAQUD5Q8-5rAA-7YdxlQkZwGWWoqnl_eBFMIMVvWSWGNU4FB/exec`) vào mã nguồn gốc của cả `script.js` và `donggop.html`.
  - Mọi thiết bị, mọi trình duyệt (cả điện thoại của cô, học sinh, tab ẩn danh) mở web lên đều tự động kết nối chung 1 cơ sở dữ liệu duy nhất mà không cần dán link thủ công.

### 3. Đồng bộ hóa xóa dữ liệu & Khắc phục mất ảnh
- **Đồng bộ Xóa cho Quản trị viên**:
  - Đã khắc phục lỗi "hồi sinh" dữ liệu: Quy định Google Sheets là **Nguồn Chuẩn Duy Nhất (Single Source of Truth)**. Khi Admin bấm xóa một lời chúc hoặc ảnh, mục đó bị xóa trên Sheet và tự động biến mất trên tất cả thiết bị khác, không bị bộ nhớ tạm phục hồi lại.
  - Nút Xóa trong Admin Dashboard có trạng thái chờ máy chủ xác nhận và đồng bộ tức thời qua `BroadcastChannel`.
- **Khắc phục lỗi mất ảnh**:
  - Tạo ID ảnh độc nhất tuyệt đối theo micro-giây (`Date.now() + i + random + performance.now`), triệt tiêu hoàn toàn lỗi trùng ID.
  - Cơ chế quản lý ảnh nhận diện theo cả ID và URL Google Drive, bảo đảm không bao giờ bị ghi đè.
  - Bổ sung cơ chế fallback tự động cho link Google Drive nếu kết nối mạng di động chập chờn.

### 4. Đồng bộ lượt Thả tim Thời gian thực (Live Hearts) & Đặt lại về 0
- **Lượt thả tim bắt đầu từ số 0**: Đã thiết lập cơ chế reset toàn diện trên toàn bộ client và localStorage (`co_duyen_anh_hearts_reset_v2`), đảm bảo mọi người dùng mở trang web đều thấy bộ đếm tim xuất phát từ 0.
- **Công cụ Quản trị viên**: Bổ sung nút `Đặt lại lượt tim về 0` trong Bảng điều khiển Quản trị viên tại `donggop.html`. Khi Admin bấm xác nhận, hệ thống lập tức phát tín hiệu BroadcastChannel `RESET_HEARTS` để mọi tab/thiết bị đang mở lập tức về 0, đồng thời gửi yêu cầu lên Google Apps Script (`action: resetHearts`).
- **Tích hợp kỹ thuật gom lượt bấm (Debounce Batching 1.2s)**: Khi học sinh bấm thả tim liên tục tạo hoa tim bay rực rỡ, hệ thống tự động gom lại và gửi 1 request nhẹ nhàng lên Google Sheets.
- **Backend Google Apps Script**: Hàm `resetHeartsInSheet` tự động đặt lại giá trị cột `Total_Hearts` về 0 và ghi nhận thời gian cập nhật.

### 5. Tinh chỉnh giao diện nút bấm cuối trang (Anti-AI Slop)
- Rút gọn nhãn nút bấm cân đối, súc tích:
  - Nút trái: `Viết lời chúc gửi Cô`
  - Nút phải: `Thêm ảnh vào cuộn phim`
- Khắc phục hoàn toàn lỗi chữ tràn ra ngoài khung viền.
- Tối ưu hiển thị responsive: trên điện thoại (< 600px), cụm nút tự động xếp dọc đều đặn, dễ thao tác chạm bấm.

### 6. Tối ưu hóa hiệu năng di động cực hạn (Anti-Lag Mobile Performance)
- **Bản sao lưu an toàn**: Đã tạo bản sao lưu toàn diện tại thư mục `Bản sao lưu trang web trước khi tối ưu điện thoại` và gắn git tag `backup-truoc-khi-toi-uu`.
- **Triệt tiêu Scroll Repaint Lag**:
  - Gỡ bỏ hoàn toàn `background-attachment: fixed` trên thẻ `body` (nguyên nhân gây tụt FPS và render lại toàn bộ màn hình liên tục khi cuộn trên iOS Safari & Android Chrome). Chuyển nền gradient sang container cố định `#scene` kết hợp thuộc tính `touch-action: pan-y`.
- **Triệt tiêu Forced Synchronous Layout (Reflow)**:
  - Loại bỏ hoàn toàn việc đọc `lastFrame.offsetLeft` và `lastFrame.offsetWidth` trong vòng lặp 60fps `animate(time)`. Chuyển sang tính toán và cache trước `cachedFilmMaxTranslate` trong `updateFilmDimensions()` (chỉ chạy khi resize, xoay màn hình hoặc thêm ảnh).
- **Phần cứng hóa hoạt họa (Hardware Compositing)**:
  - Chuyển toàn bộ hoạt họa `translateX` và hạt bụi sang `translate3d(..., 0)` để tận dụng GPU Compositor mà không tiêu tốn tài nguyên CPU.
- **Tối ưu hạt động & biểu tượng cho màn hình nhỏ**:
  - Tự động điều chỉnh số lượng bụi vũ trụ từ 65 xuống 18 và icon từ 36 xuống 10 khi duyệt bằng điện thoại, giảm 70% khối lượng tính toán DOM mỗi khung hình.
  - Vô hiệu hóa `box-shadow` và `filter: drop-shadow` trên các hạt li ti khi xem trên thiết bị di động.
- **Giải mã ảnh bất đồng bộ (Async Image Decoding)**:
  - Thêm thuộc tính `decoding="async"` cho toàn bộ 26 khung ảnh cuộn phim 35mm, ảnh cô Duyên Anh và ảnh đóng góp mới, giải phóng hoàn toàn luồng chính (Main Thread).

### 7. Trang Album Ảnh Kỷ Niệm 35mm Riêng Biệt (album.html)
- **Thiết kế phong cách hoài niệm cổ điển**: 
  - Giao diện phòng tối rọi phim (Darkroom Contact Sheet) kết hợp tông màu than ấm và vàng hổ phách Kodak (`#f59e0b`).
  - Toàn bộ ảnh đóng góp từ học sinh được sắp xếp dưới dạng **Lưới ô ảnh tĩnh chia ngăn (Grid layout)**, không dùng hiệu ứng cuộn trượt ngang phức tạp, mang lại trải nghiệm hoài niệm, tĩnh lặng và trang trọng.
  - Mỗi khung hình mô phỏng chính xác dải phim 35mm với dải răng cưa `KODAK 500T`, `EASTMAN SAFETY FILM` và số thứ tự phim `01A`, `02A`,...
- **Bảng thông tin người đăng chi tiết (Metadata Plate)**:
  - Tên học sinh đóng góp (icon người gửi), thời gian đăng và lời nhắn tâm tình trích dẫn trang nhã dưới từng tấm hình.
- **Tính năng tìm kiếm & Phóng to (Lightbox)**:
  - Thanh tìm kiếm tức thời theo tên bạn gửi hoặc nội dung chú thích.
  - Chạm vào bất kỳ khung phim nào để mở cửa sổ phóng to toàn màn hình với đầy đủ chi tiết kỷ niệm.
- **Đồng bộ thời gian thực 2 chiều**:
  - Tự động nạp trực tiếp danh sách ảnh từ Google Sheets và bộ nhớ cục bộ.
  - Lắng nghe `BroadcastChannel` để cập nhật tức thì ngay khi có bạn học trò mới đăng ảnh từ trang `donggop.html`.

### 5. Nút đặt lại về ban đầu (Reset to Default) & Khôi phục hệ thống (Yêu cầu 5)
- **Nút công cụ Quản trị viên `btn-reset-default`**:
  - Đặt tại Bảng điều khiển Quản trị viên (`donggop.html`) với nhãn chuẩn mực: *"Đặt lại về ban đầu"*.
  - Có hộp thoại cảnh báo bảo mật xác nhận 2 lớp rõ ràng trước khi thực hiện.
- **Dọn dẹp và khôi phục trạng thái mặc định**:
  - Đưa `co_duyen_anh_hearts` về `0`.
  - Làm trống danh sách ảnh đóng góp thử nghiệm `co_duyen_anh_photos` (`[]`) và danh sách ID đã xóa `co_duyen_anh_deleted_ids`.
  - Nạp lại lời chúc chuẩn ban đầu từ `wishes.json`.
  - Dọn dẹp hàng đợi ngoại tuyến `pending_wishes` và `pending_photos`.
- **Đồng bộ thời gian thực toàn hệ sinh thái trang web**:
  - Phát tín hiệu `{ action: 'RESET_TO_DEFAULT', hearts: 0 }` qua kênh `BroadcastChannel('co_duyen_anh_sync_channel')`.
  - Tự động cập nhật tức thì trên trang chính `index.html` (cuộn phim và danh thiếp lời chúc trở về mặc định, lượt tim về 0), trang album `album.html` (làm mới ô ảnh và hiện thông báo) và trang `donggop.html`.
- **Hỗ trợ Backend Google Apps Script (`Code.gs`)**:
  - Tiếp nhận lệnh `action: 'resetToDefault'` / `action: 'resetAll'`.
  - Hàm `resetSheetDataToDefault(ss)` tự động dọn dẹp các dòng dữ liệu thử nghiệm trong sheet `Wishes` và `Photos`, đồng thời đưa sheet `Hearts` về 0.

---

## III. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (TEST SUITE)

Dự án được bảo vệ bởi bộ kiểm thử tự động khép kín 5 tầng (Tier 1 đến Tier 5):
- **Tệp thực thi**: `tests/run_tests.py`
- **Tổng số ca kiểm thử**: **76 bài test** (F1-F19 Feature Suites)
- **Kết quả**: **76/76 PASS (100% Thành công)** trong thời gian thực thi ~0.6 giây.
- **Kiểm toán độc lập (Teamwork Victory Audit)**: Phán quyết **VICTORY CONFIRMED**.

---

## IV. BẢNG TRA CỨU TỆP TIN CỐT LÕI (FILE REGISTRY)

| Tên tệp | Vai trò | Trạng thái |
| :--- | :--- | :--- |
| [index.html](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/index.html) | Trang web thiệp tri ân chính (6 giai đoạn scrollytelling, decoding async, reset listener) | Đã cập nhật & Deploy |
| [donggop.html](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/donggop.html) | Trang đóng góp ảnh/lời chúc & Bảng điều khiển Quản trị viên (nút Đặt lại về ban đầu & Đặt lại lượt tim) | Đã cập nhật & Deploy |
| [album.html](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/album.html) | Trang album ảnh kỷ niệm 35mm riêng biệt (phong cách hoài niệm, chia ô, thông tin người đăng, đồng bộ reset) | Đã cập nhật & Deploy |
| [script.js](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/script.js) | Logic hoạt họa 60fps, translate3d, cache kích thước, xử lý RESET_TO_DEFAULT & RESET_HEARTS | Đã cập nhật & Deploy |
| [styles.css](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/styles.css) | Định kiểu giao diện, tối ưu GPU di động, phong bì 3D, responsive | Đã cập nhật & Deploy |
| [Code.gs](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/Code.gs) | Mã nguồn Google Apps Script (hỗ trợ resetHearts, resetToDefault, deleteItem, Google Drive/Sheets) | Đã cập nhật & Deploy |
| [wishes.json](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/wishes.json) | Dữ liệu tĩnh dự phòng chuẩn ban đầu khi ngoại tuyến và khi reset | Hoạt động bình thường |
| [tests/run_tests.py](file:///g:/My%20Drive/H%C3%ACnh%20%E1%BA%A3nh%20k%E1%BB%B7%20ni%E1%BB%87m/%C3%80nh%20d%C3%ACm%20c%C3%B4%20Duy%C3%AAn%20Anh/Trang%20web%20k%E1%BB%B7%20ni%E1%BB%87m%20c%C3%B4%20Duy%C3%AAn%20Anh/tests/run_tests.py) | Bộ chạy kiểm thử tự động toàn hệ thống (76 tests F1-F19) | 100% PASS |

---

## V. HƯỚNG DẪN KHI BẮT ĐẦU PHIÊN TRÒ CHUYỆN MỚI

Khi bạn mở phiên trò chuyện mới, bạn chỉ cần gửi câu lệnh sau cho trợ lý:
> *"Tôi đang tiếp tục phát triển dự án Trang web kỷ niệm cô Duyên Anh. Hãy đọc tệp `Báo cáo tổng kết dự án chuyển tiếp phiên trò chuyện mới.md` trong thư mục dự án để nắm toàn bộ ngữ cảnh kỹ thuật đã hoàn thành."*

Trợ lý mới sẽ ngay lập tức nắm được 100% bối cảnh, hiểu rõ cấu trúc backend Google Sheets, cuộn phim 26 khung hình và sẵn sàng phục vụ các yêu cầu tiếp theo của bạn mà không cần phải giải thích lại từ đầu!
