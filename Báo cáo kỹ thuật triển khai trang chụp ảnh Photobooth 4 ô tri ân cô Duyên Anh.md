# Báo Cáo Kỹ Thuật Triển Khai Trang Chụp Ảnh Photobooth 4 Ô Tri Ân Cô Duyên Anh

## 1. Tổng Quan Triển Khai Milestone 4
Milestone 4 tập trung xây dựng hoàn chỉnh ứng dụng Photobooth dải 4 ảnh độc lập (`photobooth.html`, `photobooth.js`, `photobooth.css`) kết hợp thư viện 8 mẫu khung dải ảnh và 12 sticker nét mảnh vector trang nhã phục vụ tri ân cô Duyên Anh.

Ứng dụng tuân thủ nghiêm ngặt chuẩn thiết kế **Anti-AI Slop** (lưới 4px, tông màu graphite ấm áp điểm hổ phách, typography chuẩn phân cấp, không gradient neon, không emoji làm icon) và không phụ thuộc bất kỳ thư viện bên ngoài nặng nề nào.

---

## 2. Danh Sách Tính Năng & Thành Phần Đã Hoàn Thành

### 2.1. F9: Trích Xuất & Chuẩn Bị 8 Mẫu Khung Photobooth 4 Ô
- Thư mục lưu trữ: `assets/frames/photobooth/`
- Bao gồm:
  1. `pb_vintage_kraft`: Vintage Kraft Linen (Dải 16:9, kích thước 560 × 1320 px, 4 ô 448 × 250 px, tông be ấm chân cam đất hoài niệm).
  2. `pb_ocean_sky`: Ocean Sky Blue (Dải 16:9, kích thước 560 × 1320 px, tông xanh trời chân xanh đại dương sâu lắng).
  3. `pb_sage_mint`: Sage Mint Green (Dải 16:9, kích thước 560 × 1320 px, tông xanh bạc hà dịu mát chân ngọc lục bảo).
  4. `pb_pastel_ice`: Pastel Ice Blue (Dải 16:9, kích thước 560 × 1320 px, tông xanh băng tuyết pastel chân xanh thẫm).
  5. `pb_peach_apricot`: Peach Warm Apricot (Dải 16:9, kích thước 560 × 1320 px, tông cam đào mơ chín chân ngà ấm áp).
  6. `pb_dark_pine`: Dark Pine Teal (Dải 16:9, kích thước 560 × 1320 px, tông xanh thông thẫm điểm vàng chanh).
  7. `pb_vintage_wine`: Vintage Wine Burgundy (Dải 16:9, kích thước 560 × 1320 px, tông đỏ vang nho nồng ấm điểm vàng bơ).
  8. `pb_studio_burgundy`: Studio Burgundy Vintage (Dải 4:3, kích thước 627 × 1875 px, 4 ô 449 × 338 px, phong cách dải phim Studio Photobooth chuẩn 2 × 6 inch quốc tế).
- Mỗi mẫu khung có:
  + Tệp PNG RGBA trong suốt 100% tại 4 ô ảnh (`alpha = 0`) để hiển thị ảnh lồng bên dưới với viền ngoài sắc nét.
  + Tệp thumbnail thu nhỏ hiển thị trong khay chọn mẫu.
  + Tệp chỉ mục dữ liệu `frames.json` lưu trữ thông số pixel, tọa độ slots, màu sắc và kiểu chữ.

### 2.2. F10: Bộ Sticker Nét Mảnh & Công Cụ Văn Bản
- Thư mục lưu trữ: `assets/stickers/`
- Bộ 12 sticker vector SVG nét vẽ 1.5 - 2px thanh nhã:
  1. `postmark_vintage.svg`: Dấu bưu điện kỷ niệm 20/11 cổ điển.
  2. `stamp_gratitude.svg`: Con tem thư tri ân viền răng cưa thủ công.
  3. `botanical_branch.svg`: Nhành hoa lá vẽ tay thanh mảnh nghệ thuật.
  4. `graduation_cap.svg`: Nón cử nhân tốt nghiệp trang nhã với tua rua buông rủ.
  5. `washi_tape_blush.svg`: Băng dán washi hoa hồng pastel viền xé tự nhiên.
  6. `washi_tape_vintage.svg`: Băng dán washi kraft hoài niệm.
  7. `heart_delicate.svg`: Trái tim nét mảnh uốn lượn đôi.
  8. `calligraphy_trian.svg`: Chữ thư pháp uốn lượn "Tri ân".
  9. `calligraphy_kyniem.svg`: Chữ viết tay "Kỷ niệm dấu yêu".
  10. `badge_2011.svg`: Huy hiệu tròn kỷ niệm 20.11 Ngày Nhà Giáo Việt Nam.
  11. `sparkle_minimal.svg`: Cụm ánh sao lấp lánh 4 cánh tối giản.
  12. `film_roll_mini.svg`: Cuộn phim 35mm hoài niệm.
- Công cụ văn bản:
  + Hỗ trợ 4 font chữ tích hợp: `Dancing Script`, `Playfair Display`, `Be Vietnam Pro`, `Space Grotesk`.
  + Bảng màu chữ tinh tế: Trắng (#FFFFFF), Vàng Gold (#F59E0B), Nâu gỗ (#78350F), Đen mun (#18181B), Đỏ son (#DC2626), Xanh ngọc (#047857).
  + Thanh trượt điều chỉnh kích thước chữ (16px - 72px) và xoay chuyển tự do.
- Tương tác trực tiếp trên Canvas:
  + Hỗ trợ cả chuột (Pointer) và cảm ứng di động (Touch).
  + Kéo thả di chuyển (Drag).
  + Xoay góc tự do qua chốt xoay tròn (Rotate).
  + Phóng to / thu nhỏ qua chốt góc (Scale).
  + Nút xóa trực tiếp (Delete handle) và bảng quản lý lớp (Layers panel).

### 2.3. F11: Quy Trình Nạp Ảnh & Camera WebRTC
- Stepper 4 bước mượt mà:
  + **Bước 1**: Chọn mẫu khung (Lưới 8 mẫu kèm bộ lọc 16:9 và 4:3).
  + **Bước 2**: Nạp 4 ảnh:
    * Luồng video xem trước WebRTC với nút lật camera trước / sau (`facingMode`), lật gương (`mirror toggle`).
    * Chế độ đếm ngược (0s, 3s, 5s) kèm hiệu ứng chữ số đếm ngược to rõ và thông báo nhắc tạo dáng.
    * Âm thanh màn trập chân thực tổng hợp trực tiếp bằng Web Audio API (không phụ thuộc tệp âm thanh bên ngoài) và hiệu ứng chớp sáng trắng (flash animation).
    * Chế độ **Chụp liên hoàn 4 kiểu (Auto 4-burst)**: Tự động đếm ngược và chụp tuần tự 4 kiểu ảnh cho cả 4 ô.
    * Nạp ảnh từ thiết bị: Cho phép tải từng ảnh cho từng ô riêng lẻ hoặc tải hàng loạt 4 ảnh cùng lúc.
    * Xoay ảnh 90° và đổi / xóa ảnh linh hoạt cho từng ô riêng lẻ.
  + **Bước 3**: Trang trí dải ảnh (Khay sticker 12 mẫu, công cụ viết chữ và quản lý lớp).
  + **Bước 4**: Xem trước và xuất ảnh chất lượng cao.

### 2.4. F12: Động Cơ Canvas Render & Xuất Ảnh Độ Nét Cao
- Thứ tự vẽ lớp chuẩn xác:
  1. Lớp nền dải photobooth (`bgColor`).
  2. Lớp 4 ô ảnh chụp/nạp (thuật toán aspect-cover tự động căn giữa không làm méo hình, hỗ trợ xoay ảnh).
  3. Lớp khung phủ dải ảnh (template PNG overlay giữ nguyên viền, logo, texture và footer).
  4. Lớp văn bản tùy biến.
  5. Lớp sticker trang trí.
- Xuất ảnh 2x DPI scale sắc nét:
  + Định dạng 16:9: Độ phân giải kết xuất 1120 × 2640 px (chuẩn in ấn 300 DPI).
  + Định dạng 4:3: Độ phân giải kết xuất 1254 × 3750 px (chuẩn in ấn 300 DPI dải phim 2 × 6 inch).
  + Nút tải ảnh PNG chất lượng cao.
  + Nút tải ảnh JPEG tối ưu dung lượng.
  + Nút sao chép ảnh vào Clipboard (`navigator.clipboard.write`) với thông báo Toast.

### 2.5. F13: Tích Hợp Nút Điều Hướng Liên Kết Toàn Mạng Lưới
- Trang `index.html`: Bổ sung nút liên kết `.action-btn.photobooth-btn` tại khối `.tribute-extra-actions` bên trong `#final-tribute`.
- Trang `album.html`: Bổ sung nút "Chụp Photobooth 4 ô" tại thanh điều hướng đầu trang.
- Trang `donggop.html`: Bổ sung nút "Chụp Photobooth 4 ô" tại thanh điều hướng đầu trang.
- Trang `photobooth.html`: Có sẵn các nút điều hướng nhanh về Trang chủ, Thư viện ảnh, và Đóng góp.

---

## 3. Xác Minh Cú Pháp & Kiểm Thử
1. **Kiểm tra cú pháp JavaScript**:
   - `node -c photobooth.js` -> Hợp lệ (Mã thoát 0, không có lỗi).
   - `node -c script.js` -> Hợp lệ.
   - `node -c find_unused.js` -> Hợp lệ.
2. **Kiểm tra tính toàn vẹn tệp tài nguyên**:
   - Đã xác thực toàn bộ 8 tệp khung overlay PNG và 8 tệp thumbnail tồn tại, chuẩn chế độ RGBA, đúng kích thước 560 × 1320 px (16:9) và 627 × 1875 px (4:3).
   - Đã xác thực toàn bộ 12 tệp sticker vector SVG tồn tại, hiển thị sắc nét.
3. **Tuân thủ quy tắc R5**:
   - Không chạy lệnh `tests/run_tests.py` trong suốt quá trình triển khai.
