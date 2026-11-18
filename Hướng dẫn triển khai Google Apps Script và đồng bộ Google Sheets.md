# Hướng dẫn triển khai Google Apps Script và đồng bộ Google Sheets

Tài liệu này hướng dẫn chi tiết từng bước cách thiết lập Google Sheets và triển khai Google Apps Script (GAS) Web App làm hệ thống backend lưu trữ đám mây, đồng bộ hóa thời gian thực các lời chúc tri ân và hình ảnh kỷ niệm cho trang web **Thiệp tri ân 20/11 Cô Duyên Anh**.

---

## 1. Tổng quan kiến trúc hệ thống

Trang web sử dụng mô hình kết hợp (Hybrid Architecture) linh hoạt và bền bỉ:
- **Google Sheets**: Cơ sở dữ liệu đám mây miễn phí, trực quan, dễ quản lý, xem và xuất dữ liệu.
- **Google Drive**: Lưu trữ các tệp hình ảnh đóng góp từ học sinh một cách tối ưu, tự động chuyển đổi thành đường dẫn công khai (Public URL).
- **Google Apps Script Web App**: Đóng vai trò là API trung gian (Serverless REST API) xử lý tiếp nhận dữ liệu (`doPost`) và truy xuất dữ liệu (`doGet`).
- **Cơ chế dự phòng ngoại tuyến (Offline Fallback)**: Nếu chưa cấu hình URL Web App hoặc khi mất kết nối mạng, trang web tự động chuyển về nạp dữ liệu từ tệp cục bộ `wishes.json` và bộ nhớ trình duyệt `localStorage`, đảm bảo người dùng luôn có trải nghiệm mượt mà, không bao giờ bị gián đoạn.

---

## 2. Các bước triển khai từng bước

### Bước 1: Tạo bảng tính Google Sheets mới
1. Truy cập vào tài khoản Google của bạn tại [Google Drive](https://drive.google.com/) hoặc [Google Sheets](https://sheets.google.com/).
2. Nhấn nút **Mới (+)** > chọn **Google Trang tính (Google Sheets)**.
3. Đặt tên cho bảng tính, ví dụ: `Thiệp Tri Ân Cô Duyên Anh - Dữ Liệu Lời Chúc`.

*(Lưu ý: Bạn không cần tạo trước các cột hay trang tính con. Mã nguồn Apps Script sẽ tự động khởi tạo 2 trang tính `Wishes` và `Photos` kèm định dạng tiêu đề chuyên nghiệp ngay trong lần chạy đầu tiên).*

---

### Bước 2: Mở trình soạn thảo Google Apps Script
1. Trên thanh bảng chọn trên cùng của Google Sheets, chọn:
   **Tiện ích mở rộng (Extensions)** > **Apps Script**.
2. Một tab trình duyệt mới sẽ mở ra giao diện lập trình của Google Apps Script.
3. Đổi tên dự án từ *Dự án không có tiêu đề* thành `Backend Thiệp Tri Ân Cô Duyên Anh`.

---

### Bước 3: Dán mã nguồn từ tệp Code.gs
1. Trong trình soạn thảo Apps Script, xóa toàn bộ nội dung mặc định trong tệp `Mã.gs` (hoặc `Code.gs`).
2. Mở tệp `Code.gs` có sẵn trong thư mục dự án này, sao chép toàn bộ nội dung và dán vào trình soạn thảo Apps Script.
3. Nhấn biểu tượng **Lưu (Save / Ctrl + S)** để lưu mã nguồn.

---

### Bước 4: Triển khai ứng dụng web (Deploy as Web App)
1. Ở góc trên cùng bên phải của giao diện Apps Script, nhấn nút **Triển khai (Deploy)** > chọn **Tùy chọn triển khai mới (New deployment)**.
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn **Ứng dụng web (Web app)**.
3. Điền các trường thông tin quan trọng như sau:
   - **Mô tả (Description)**: `Thiệp tri ân Cô Duyên Anh v1.0`
   - **Thực thi dưới dạng (Execute as)**: Chọn **Tôi (Me - địa chỉ email Google của bạn)**
   - **Ai có quyền truy cập (Who has access)**: Chọn **Bất kỳ ai (Anyone)**  
     *(⚠️ Cực kỳ quan trọng: Phải chọn "Bất kỳ ai" để học sinh và mọi thiết bị có thể gửi lời chúc và đọc dữ liệu mà không cần phải đăng nhập tài khoản Google cá nhân).*
4. Nhấn nút **Triển khai (Deploy)**.

---

### Bước 5: Cấp quyền truy cập (Authorization)
1. Trong lần triển khai đầu tiên, Google sẽ hiển thị hộp thoại yêu cầu cấp quyền truy cập vào Google Sheets và Google Drive của bạn.
2. Nhấn nút **Ủy quyền truy cập (Authorize access)**.
3. Chọn tài khoản Google của bạn.
4. Nếu xuất hiện màn hình cảnh báo "Google chưa xác minh ứng dụng này" (*Google hasn't verified this app*):
   - Nhấn vào liên kết **Nâng cao (Advanced)** ở góc dưới bên trái.
   - Chọn **Đi tới Backend Thiệp Tri Ân Cô Duyên Anh (không an toàn)** (*Go to ... (unsafe)*).
5. Nhấn nút **Cho phép (Allow)** để cấp quyền.

---

### Bước 6: Sao chép URL Ứng dụng web (Web App URL)
1. Sau khi cấp quyền thành công, màn hình sẽ hiển thị hộp thoại chứa **URL ứng dụng web** (Web app URL).
2. Đường link có định dạng tương tự như:  
   `https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec`
3. Nhấn **Sao chép (Copy)** đường dẫn này.

---

### Bước 7: Cấu hình URL vào trang web

Bạn có thể kết nối URL Web App vào trang web theo **1 trong 2 cách** thuận tiện sau:

#### Cách 1: Cấu hình trực tiếp trên giao diện Admin Dashboard (Khuyên dùng - Không cần sửa mã)
1. Mở trang web `donggop.html` trên trình duyệt.
2. Nhấn nút **Quản trị viên (Admin)** ở góc trên trang.
3. Nhập mật khẩu quản trị: `trannguyen21022008trian` và nhấn **Xác nhận**.
4. Chuyển sang thẻ **Cấu hình Google Sheets**.
5. Dán URL Web App bạn vừa sao chép ở Bước 6 vào ô nhập liệu.
6. Nhấn nút **Lưu cấu hình** và nút **Kiểm tra kết nối**.
   - Trình duyệt sẽ lưu URL này vào bộ nhớ và tự động đồng bộ hóa trên máy của bạn.
   - Nhấn **Đồng bộ ngay** để nạp tức thì toàn bộ dữ liệu mới nhất từ Google Sheets về trang web!

#### Cách 2: Cấu hình mặc định trong mã nguồn (Đồng bộ cho tất cả mọi người truy cập)
1. Mở tệp `script.js` và `donggop.html`.
2. Tìm đến hằng số `GAS_CONFIG` ở phần đầu tệp:
   ```javascript
   const GAS_CONFIG = {
     // Dán URL Web App Google Apps Script của bạn vào đây:
     WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
     ...
   };
   ```
3. Dán URL Web App của bạn vào giữa cặp dấu nháy đơn `''`.
4. Lưu tệp. Bây giờ tất cả học sinh, bạn bè khi truy cập trang web từ bất kỳ thiết bị nào đều sẽ tự động gửi và nhận dữ liệu qua Google Sheets của bạn!

---

## 3. Cách hoạt động của các API trong Code.gs

### 1. Truy xuất dữ liệu (HTTP GET)
- **Kiểm tra trạng thái (Ping)**:  
  `GET https://.../exec?action=ping`  
  Phản hồi trạng thái hoạt động của hệ thống:
  ```json
  {
    "status": "success",
    "message": "Google Apps Script Web App đang hoạt động bình thường!",
    "serverTime": "2026-11-18T10:00:00.000Z"
  }
  ```
- **Lấy toàn bộ lời chúc và hình ảnh**:  
  `GET https://.../exec?action=getWishes`  
  Trả về danh sách dữ liệu có trong trang tính:
  ```json
  {
    "status": "success",
    "wishes": [
      {
        "id": "wish-1",
        "author": "Trần Nguyên",
        "wish": "Kính chúc Cô Duyên Anh ngày 20/11 thật nhiều niềm vui...",
        "time": "2026-11-17",
        "image": ""
      }
    ],
    "photos": [],
    "count": 1
  }
  ```

### 2. Gửi lời chúc mới (HTTP POST)
- Endpoint: `POST https://.../exec`
- Header: `Content-Type: text/plain;charset=utf-8` *(giúp vượt qua rào cản CORS preflight OPTIONS của trình duyệt một cách mượt mà)*
- Body JSON:
  ```json
  {
    "action": "addWish",
    "id": "wish-1700000000000-abcd",
    "author": "Minh Thư (Tổ 2)",
    "wish": "Nhân ngày 20/11, con chúc Cô luôn mạnh khỏe, trẻ trung và hạnh phúc ạ!",
    "time": "18/11/2026 10:30",
    "image": ""
  }
  ```

### 3. Đóng góp hình ảnh (HTTP POST)
- Endpoint: `POST https://.../exec`
- Body JSON:
  ```json
  {
    "action": "addPhoto",
    "id": "photo-1700000000000-efgh",
    "author": "Tập thể 12-3",
    "caption": "Kỷ niệm ngày hội trường",
    "image": "data:image/webp;base64,...",
    "aspect": "landscape",
    "time": "18/11/2026 10:35"
  }
  ```
  *Đặc điểm ưu việt*: Khi nhận dữ liệu ảnh dạng chuỗi Base64, Google Apps Script sẽ tự động giải mã và tạo tệp ảnh trực tiếp trên Google Drive trong thư mục `"Kỷ niệm Cô Duyên Anh - Ảnh và Thiệp Đóng Góp"`, sau đó cấp quyền xem công khai và chỉ lưu URL gọn nhẹ vào ô tính Google Sheets. Điều này giải quyết triệt để hạn chế 50.000 ký tự trên mỗi ô tính của Google Sheets.

---

## 4. Cơ chế dự phòng ngoại tuyến (Offline Resilience)

Trang web được thiết kế với độ tin cậy tuyệt đối nhờ 3 tầng bảo vệ:
1. **Tầng 1 (Đám mây Google Sheets)**: Khi có URL Web App và có kết nối Internet, trang web tải dữ liệu mới nhất từ Google Sheets và hợp nhất thông minh với dữ liệu máy khách.
2. **Tầng 2 (Tệp tĩnh wishes.json)**: Nếu Google Apps Script chưa được cấu hình hoặc phản hồi chậm/lỗi, trang web tự động tải danh sách lời chúc mặc định từ tệp `wishes.json`.
3. **Tầng 3 (Bộ nhớ cục bộ localStorage)**: Khi hoàn toàn mất kết nối mạng (Offline), trang web sử dụng dữ liệu đã lưu trong `localStorage` để hiển thị ngay lập tức, đồng thời lưu các lời chúc mới gửi vào hàng đợi chờ đồng bộ (`co_duyen_anh_pending_wishes`) và sẽ tự động gửi lên Google Sheets ngay khi có mạng trở lại.
4. **Cơ chế chống hồi sinh (Tombstone Protection)**: Mọi lời chúc hoặc hình ảnh đã bị Quản trị viên xóa đều được ghi nhận vào danh sách `co_duyen_anh_deleted_ids`, đảm bảo các mục đã xóa sẽ không bao giờ xuất hiện trở lại trên giao diện người dùng.

---

## 5. Xử lý sự cố thường gặp (Troubleshooting)

- **Lỗi `Script function not found: doGet`**: Đảm bảo bạn đã sao chép đầy đủ toàn bộ tệp `Code.gs` và đã nhấn Lưu trước khi triển khai.
- **Lỗi quyền truy cập (Authorization Required / CORS)**: Khi triển khai Web App, bạn phải chọn mục **Ai có quyền truy cập (Who has access)** là **Bất kỳ ai (Anyone)**. Nếu vô tình chọn "Chỉ mình tôi", người dùng khác sẽ không thể truy cập API.
- **Sau khi sửa mã nguồn trong Apps Script nhưng trang web không thay đổi**: Mỗi khi sửa mã trong `Code.gs`, bạn phải vào **Triển khai** > **Quản lý bản triển khai (Manage deployments)** > Nhấn vào biểu tượng bút chì để chỉnh sửa > Chọn **Phiên bản mới (New version)** > Nhấn **Triển khai (Deploy)** để cập nhật phiên bản mới.
