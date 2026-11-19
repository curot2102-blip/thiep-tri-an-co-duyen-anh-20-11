# Hướng dẫn triển khai Google Apps Script cho Trang web kỷ niệm cô Duyên Anh

Tài liệu này hướng dẫn chi tiết từng bước cập nhật và triển khai phiên bản mới (New Version Deployment) cho Google Apps Script Web App của trang web Tri ân Cô Duyên Anh, nhằm kích hoạt đầy đủ tính năng đồng bộ lượt thả tim hai chiều thời gian thực và loại bỏ triệt để nguy cơ xung đột ghi đè (Race Condition).

---

## 1. Mục đích nâng cấp

Phiên bản `Code.gs` mới bổ sung các tính năng cốt lõi sau:
1. **Khóa đa luồng độc quyền (`LockService`)**: Sử dụng `LockService.getScriptLock()` với thời gian chờ 10 giây trong hàm `incrementHeartsInSheet` và `resetHeartsInSheet`. Cơ chế này đảm bảo khi hàng chục học sinh cùng thả tim tại một thời điểm, các lượt bấm đều được xếp hàng xử lý tuần tự và ghi nhận đầy đủ vào Google Sheets mà không bị ghi đè hay mất mát dữ liệu.
2. **Endpoint siêu nhẹ (`action=getHearts`)**: Cho phép trình duyệt truy vấn số tim trực tiếp từ ô tính B2 của trang tính `Hearts` và trả về `{ status: "success", hearts: <số_lượng>, serverTime: "<thời_gian>" }`. Quá trình này chỉ đọc đúng 1 ô duy nhất, nhanh gấp 20 lần so với việc tải toàn bộ trang tính, giúp tiết kiệm tối đa hạn ngạch thực thi (quota) hàng ngày của tài khoản Google.
3. **Đồng bộ hai chiều với bảng quản trị**: Hỗ trợ lệnh đặt lại lượt tim (`resetHearts`) từ Bảng điều khiển Quản trị viên trên `donggop.html`.

---

## 2. Các bước triển khai chi tiết trên Google Apps Script

### Bước 1: Mở dự án Google Apps Script
1. Đăng nhập vào tài khoản Google sở hữu bảng tính Google Sheets lưu trữ dữ liệu của trang web.
2. Mở tệp Google Sheets của dự án.
3. Trên thanh bảng chọn trên cùng, nhấn vào **Tiện ích mở rộng** (Extensions) > chọn **Apps Script**. Trình soạn thảo Google Apps Script sẽ được mở ra trong tab mới.

### Bước 2: Cập nhật mã nguồn `Code.gs`
1. Tại khung danh sách tệp bên trái của Apps Script, chọn tệp `Code.gs` (hoặc `Mã.gs`).
2. Chọn toàn bộ nội dung mã nguồn cũ trong trình soạn thảo (nhấn `Ctrl + A`).
3. Sao chép toàn bộ nội dung từ tệp `Code.gs` mới nhất trong thư mục dự án và dán đè vào trình soạn thảo.
4. Nhấn biểu tượng đĩa mềm **Lưu dự án** (Save project) hoặc phím tắt `Ctrl + S`.

### Bước 3: Triển khai phiên bản mới (Quan trọng nhất)
> **Lưu ý đặc biệt**: Trong Google Apps Script, việc chỉ lưu tệp `Code.gs` sẽ **chưa** cập nhật bản Web App công khai đang chạy. Bạn bắt buộc phải tạo phiên bản mới theo các bước dưới đây để Web App áp dụng mã nguồn mới:

1. Ở góc trên cùng bên phải của giao diện Apps Script, nhấn vào nút xanh **Triển khai** (Deploy) > chọn **Quản lý bản triển khai** (Manage deployments).
2. Trong cửa sổ Quản lý bản triển khai, tìm bản triển khai Web App hiện tại (đang có URL dạng `.../exec`).
3. Nhấn vào biểu tượng **Chỉnh sửa** (hình cây bút) ở góc trên bên phải của cửa sổ.
4. Tại mục **Phiên bản** (Version), nhấp vào menu thả xuống và chọn **Phiên bản mới** (New version).
5. (Tùy chọn) Tại ô mô tả, nhập ghi chú: `Cập nhật LockService và endpoint getHearts cho đồng bộ tim thời gian thực`.
6. Kiểm tra lại 2 cấu hình bảo mật bắt buộc:
   - **Thực thi dưới dạng** (Execute as): **Tôi** (Tài khoản Google của bạn - `Me`).
   - **Ai có quyền truy cập** (Who has access): **Bất kỳ ai** (Anyone).
7. Nhấn nút **Triển khai** (Deploy) màu xanh ở góc dưới.
8. Đợi hệ thống xuất bản xong và nhấn **Xong** (Done). URL của Web App sẽ được giữ nguyên không đổi.

---

## 3. Xác minh hoạt động sau khi triển khai

Bạn có thể tự kiểm tra xem bản triển khai mới đã hoạt động hay chưa bằng cách mở một tab trình duyệt mới hoặc dùng công cụ kiểm tra:

### Kiểm tra 1: Truy vấn số tim hiện tại (GET `getHearts`)
Mở đường dẫn sau trên trình duyệt (thay thế URL nếu bạn dùng Web App khác):
```text
https://script.google.com/macros/s/AKfycbwUrK7M8gtsRfLzXoyTBAQUD5Q8-5rAA-7YdxlQkZwGWWoqnl_eBFMIMVvWSWGNU4FB/exec?action=getHearts
```
**Kết quả chuẩn**: Trình duyệt hiển thị dữ liệu JSON:
```json
{
  "status": "success",
  "hearts": 0,
  "serverTime": "2026-11-18T..."
}
```

### Kiểm tra 2: Thả tim từ trang web chính
1. Mở trang chính `index.html`.
2. Cuộn xuống cuối trang đến khu vực Tri ân `#final-tribute`.
3. Bấm vào nút Thả tim: số tim hiển thị sẽ lập tức tăng lên (Optimistic UI), hiệu ứng bay tim và âm thanh kích hoạt.
4. Mở thêm 1 cửa sổ ẩn danh hoặc tab khác: số tim trên tab mới sẽ tự động cập nhật khớp với số tim vừa bấm thông qua kết nối máy chủ Google Sheets.

---

## 4. Cơ chế dự phòng thông minh (Dual Mode Fallback)

Nếu người quản trị chưa kịp thao tác triển khai phiên bản mới trên Apps Script, trang web vẫn hoạt động hoàn toàn bình thường nhờ cơ chế Fallback được tích hợp sẵn trong mã nguồn client (`script.js`):
- Khi client gửi yêu cầu đến Web App chưa nâng cấp và nhận thông báo chưa hỗ trợ hành động, client sẽ tự động chuyển sang chế độ lưu trữ cục bộ an toàn (`localStorage`).
- Giao diện người dùng không bị treo, không vỡ bố cục, và không làm gián đoạn trải nghiệm của người xem.
- Ngay sau khi quản trị viên hoàn tất việc cập nhật bản triển khai theo hướng dẫn này, client sẽ tự động nhận diện và chuyển sang chế độ đồng bộ đám mây mà không cần chỉnh sửa lại mã nguồn giao diện.
