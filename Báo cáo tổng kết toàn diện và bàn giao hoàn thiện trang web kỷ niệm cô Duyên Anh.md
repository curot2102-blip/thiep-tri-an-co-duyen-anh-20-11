# Báo cáo tổng kết toàn diện và bàn giao hoàn thiện trang web kỷ niệm cô Duyên Anh

---

## 1. Thông tin chung dự án

- **Tên dự án**: Trang web kỷ niệm & tri ân Cô Duyên Anh (Dịp 20/11)
- **Tập thể thực hiện**: Tập thể học sinh tri ân Cô Duyên Anh
- **Kho lưu trữ chính thức**: [GitHub Repository](https://github.com/curot2102-blip/thiep-tri-an-co-duyen-anh-20-11) (Nhánh: `main`)
- **Trạng thái**: Hoàn thiện toàn diện, sẵn sàng vận hành và bàn giao chính thức.
- **Tiêu chuẩn thiết kế áp dụng**: Tuân thủ nghiêm ngặt chuẩn mực **Anti-AI Slop**, sử dụng bảng màu Graphite & Vàng hổ phách (Warm Gold), nhịp điệu khoảng cách 4px chuẩn mực, đường nét viền mảnh tinh tế và kiểu chữ trang nhã.

---

## 2. Hệ sinh thái 4 phân hệ chính của website

### 2.1. Phân hệ 1: Trang thiệp tương tác chính (`index.html`, `script.js`, `styles.css`)
- **Hành trình cuộn mượt mà (Scrollytelling 7 tầng)**:
  1. *Lớp 1 - Phong bì niêm phong sáp đỏ*: Chạm/cuộn để mở phong bì chứa thiệp chúc mừng.
  2. *Lớp 2 - Lời chào đầu trang*: Khung ảnh Cô Duyên Anh rạng rỡ cùng tiêu đề trang trọng.
  3. *Lớp 3 - Lá thư tri ân trang trọng*: Bức tâm thư tri ân người cô đáng kính.
  4. *Lớp 4 - Thư viện ảnh dìm & kỷ niệm nổi*: Các thẻ ảnh bay lơ lửng sinh động.
  5. *Lớp 5 - Cuộn phim kỷ niệm 35mm*: Trục phim Kodak 500T/Eastman cuộn ngang hiển thị các khoảnh khắc đáng nhớ.
  6. *Lớp 6 - Các lá thư con xếp tầng*: Khu vực các lời chúc từ học sinh được phân bổ theo 4 phong cách thư trang nhã.
  7. *Lớp 7 - Khu vực tương tác & điều hướng*: Cụm thả tim thời gian thực và các nút chuyển trang.
- **Hệ thống thả tim trực tiếp (Real-time Hearts)**:
  - Đồng bộ số lượt thả tim hai chiều giữa client và Google Apps Script Backend (`Code.gs`).
  - Hiệu ứng hạt tim bay lơ lửng khi nhấn, lưu trữ ngoại tuyến qua `localStorage` và cập nhật tức thì.
- **Lưới nút điều hướng hoàn thiện (CSS Grid 2 cột đối xứng)**:
  - Khắc phục triệt để lỗi ép dẹp chữ trên thiết bị di động và máy tính.
  - Hàng trên: `[Thả tim cho Cô]` & `[Cuộn lên đầu trang]` (tỉ lệ 50:50).
  - Hàng dưới: `[Viết lời chúc gửi Cô]`, `[Xem album 35mm]`, `[Đóng góp kỷ niệm]`, `[Photobooth 4 ô]` (Lưới 2x2 cân xứng tuyệt đối, tự động chuyển 1 cột trên màn hình siêu nhỏ ≤ 380px).
- **Biểu mẫu gửi lời chúc tại chỗ**: Cho phép học sinh viết lời chúc trực tiếp ngay ở trang chủ kèm lựa chọn phong cách thiệp.

---

### 2.2. Phân hệ 2: Album cuộn phim 35mm (`album.html`)
- **Phong cách hoài niệm Analog Film**:
  - Giao diện cuộn phim 35mm cổ điển với lỗ răng cưa (sprockets), viền phim KODAK 500T và số khung phim.
- **Tùy biến khung ảnh cá nhân hóa**:
  - Tự động gắn khung phim khi hiển thị ảnh trong album (Khung cổ điển Kodak, Khung xanh Olive, Khung ấm áp...).
  - Lưu trữ bền vững mã khung đã chọn qua `localStorage` và cột dữ liệu trên Google Sheets.
- **Thanh điều hướng thống nhất (`.site-nav`)**: Nút chuyển đổi nhanh dạng viên thuốc (pill) giữa Trang thiệp, Album 35mm, Đóng góp và Photobooth.

---

### 2.3. Phân hệ 3: Trang đóng góp kỷ niệm (`donggop.html`)
- **Biểu mẫu đa phương tiện phong phú**:
  - Gửi lời chúc tri ân kèm tên người gửi và lớp/niên khóa.
  - Chọn 1 trong 4 phong cách hiển thị thư độc đáo:
    1. *Hoa cỏ cổ điển* (Classic Botanical - Tông vàng ấm & viền tem hoa).
    2. *Tối giản thanh lịch* (Sage Minimalist - Tông xanh xô thơm trang nhã).
    3. *Màu nước xanh dương* (Watercolor Blue - Tông xanh dịu mát & thi vị).
    4. *Giấy da cổ xưa* (Vintage Parchment - Phong cách hoài niệm cổ kính).
  - Tải ảnh kỷ niệm lên Google Drive và chọn mẫu khung ảnh phim 35mm mong muốn.
- **Bảng điều khiển quản trị (Admin Review)**: Xem trước và quản lý danh sách lời chúc đã gửi.

---

### 2.4. Phân hệ 4: Studio chụp ảnh Photobooth 4 ô (`photobooth.html`, `photobooth.js`, `photobooth.css`)
- **Studio Photobooth tương tác chuẩn mực**:
  - Chế độ chụp trực tiếp qua Webcam/Camera trước sau hoặc tải ảnh có sẵn từ thiết bị.
  - Bộ đếm ngược 3 giây chuyên nghiệp cho từng khung hình, tạo dải ảnh 4 ô dọc đặc trưng.
- **Tùy biến khung ảnh & Sticker phong phú**:
  - 4 kiểu khung nền: Tối giản (Trắng/Đen), Dải phim cổ điển, Tri ân 20/11 Ánh vàng, Dễ thương Pastel.
  - Bộ nhãn dán (stickers) đồ họa hoa hướng dương, mũ cử nhân, trái tim, ngôi sao...
  - Thêm chữ ký tay hoặc lời chúc ngắn vào chân khung ảnh.
- **Xuất ảnh độ phân giải cao**: Sử dụng công nghệ HTML5 Canvas 2D để kết xuất ảnh rõ nét, cho phép tải ảnh về máy (`.png`) hoặc gửi trực tiếp vào kho đóng góp kỷ niệm.

---

## 3. Hệ thống Backend Google Apps Script (`Code.gs`)

Backend hoạt động không máy chủ (Serverless), miễn phí và kết nối trực tiếp với Google Sheets và Google Drive của bạn:
- **Xử lý lượt thả tim**: API `action=like` và `action=getLikes` lưu trữ số đếm trên Sheet "Thống kê".
- **Xử lý lời chúc**: Lưu trữ người gửi, nội dung, thời gian, trạng thái duyệt và phong cách thư (Cột 7: `Phong Cách Thư`).
- **Xử lý hình ảnh**: Nhận dữ liệu Base64, tạo tệp ảnh trực tiếp vào thư mục Google Drive được chỉ định, lưu URL xem ảnh và mã khung phim (Cột 8: `Mã Khung Phim`).
- **CORS & JSONP**: Hỗ trợ gọi API chéo tên miền an toàn, phản hồi dữ liệu tức thì cho client.

---

## 4. Bảng cấu trúc tệp tin trong dự án

| Tên tệp tin | Định dạng | Vai trò chính |
| :--- | :---: | :--- |
| `index.html` | HTML5 | Trang thiệp tri ân chính (7 phân đoạn cuộn scrollytelling) |
| `styles.css` | CSS3 | Bộ phong cách giao diện toàn trang web (chuẩn Anti-AI Slop) |
| `script.js` | JavaScript | Logic chuyển cảnh cuộn, thả tim, cuộn phim và tương tác chính |
| `album.html` | HTML5/JS | Trang album ảnh cuộn phim 35mm cổ điển |
| `donggop.html` | HTML5/JS | Trang gửi lời chúc, tải ảnh và chọn phong cách thư |
| `photobooth.html` | HTML5 | Giao diện studio chụp ảnh Photobooth 4 ô |
| `photobooth.js` | JavaScript | Động cơ chụp ảnh camera, ghép canvas 4 ô, chèn nhãn dán |
| `photobooth.css` | CSS3 | Bộ phong cách studio photobooth |
| `Code.gs` | Google Apps Script | Mã nguồn backend triển khai trên Google Sheets & Drive |
| `wishes.json` | JSON | Dữ liệu mẫu dự phòng cho các lời chúc |
| `.gitignore` | Config | Cấu hình loại bỏ tệp nặng và tệp rác khỏi Git |

---

## 5. Hướng dẫn triển khai và đưa vào sử dụng

### 5.1. Đưa trang web lên môi trường Internet
Website là ứng dụng tĩnh (Static Web App), bạn có thể chạy trực tiếp trên bất kỳ nền tảng nào:
- **GitHub Pages**: Vào `Settings` repository trên GitHub -> `Pages` -> Chọn nhánh `main` -> `Save`. Trang web sẽ có địa chỉ trực tuyến dạng `https://<username>.github.io/<repo-name>/`.
- **Vercel / Netlify**: Kết nối tài khoản GitHub, bấm `Import` repository, hệ thống sẽ tự động kích hoạt tên miền miễn phí với HTTPS và CDN tốc độ cao.

### 5.2. Cấu hình Backend Google Apps Script
1. Mở trang Google Sheets lưu trữ dữ liệu của bạn.
2. Vào mục `Tiện ích mở rộng` (Extensions) -> `Apps Script`.
3. Dán toàn bộ mã từ tệp `Code.gs` vào.
4. Cập nhật `FOLDER_ID` của thư mục Google Drive lưu ảnh.
5. Nhấn `Triển khai` (Deploy) -> `Tùy chọn triển khai mới` (New Deployment) -> Chọn loại `Ứng dụng web` (Web app) -> Đặt quyền truy cập là `Bất kỳ ai` (Anyone) -> Sao chép URL triển khai và cập nhật vào `script.js`, `album.html`, `donggop.html`, `photobooth.js`.

---

## 6. Tổng kết công việc dọn dẹp hệ thống

- Đã xóa sạch các tệp nháp thử nghiệm (`test_preview.html`, `find_unused.js`).
- Đã dọn sạch bộ nhớ đệm biên dịch của Python (`tests/__pycache__`).
- Giữ vững toàn bộ các hình ảnh quý giá trong thư mục `images/` và tài nguyên nhãn dán trong `assets/`.
- Mã nguồn hiện tại hoàn toàn tinh gọn, hiệu năng mượt mà và hoạt động đồng bộ trên mọi thiết bị.
