/**
 * ===================================================================
 * GOOGLE APPS SCRIPT BACKEND — THIỆP TRI ÂN 20/11 CÔ DUYÊN ANH
 * ===================================================================
 * Xử lý lưu trữ, truy xuất và đồng bộ hóa lời chúc và hình ảnh kỷ niệm
 * trực tiếp trên Google Sheets và Google Drive.
 *
 * Tác giả: Đội ngũ phát triển dự án Tri ân Cô Duyên Anh
 * Phiên bản: 1.0 (Tương thích Google Sheets & Web App Deploy)
 * ===================================================================
 */

// Tên các trang tính trong Google Sheet
var SHEET_WISHES = "Wishes";
var SHEET_PHOTOS = "Photos";
var DRIVE_FOLDER_NAME = "Kỷ niệm Cô Duyên Anh - Ảnh và Thiệp Đóng Góp";

/**
 * Xử lý yêu cầu HTTP GET
 * Dùng để kiểm tra kết nối (ping) hoặc lấy danh sách lời chúc & hình ảnh
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "getWishes";
    var callback = params.callback || "";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Không tìm thấy Google Spreadsheet đang kích hoạt. Hãy bảo đảm bạn mở Apps Script từ menu Tiện ích mở rộng > Apps Script trong Google Trang tính.");
    }
    initSheetsIfNeeded(ss);

    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "Google Apps Script Web App đang hoạt động bình thường!",
        serverTime: new Date().toISOString()
      }, callback);
    }

    if (action === "getPhotos") {
      var photos = readPhotosFromSheet(ss);
      return createJsonResponse({
        status: "success",
        photos: photos,
        count: photos.length
      }, callback);
    }

    // Mặc định hoặc action === "getWishes": Lấy cả lời chúc và ảnh
    var wishes = readWishesFromSheet(ss);
    var photosList = readPhotosFromSheet(ss);

    return createJsonResponse({
      status: "success",
      wishes: wishes,
      photos: photosList,
      count: wishes.length
    }, callback);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "Lỗi xử lý yêu cầu GET: " + error.toString()
    }, callback);
  }
}

/**
 * Xử lý yêu cầu HTTP POST
 * Nhận lời chúc mới hoặc hình ảnh đóng góp từ trang web
 */
function doPost(e) {
  try {
    var payload = {};

    // 1. Phân tích nội dung gửi lên (hỗ trợ text/plain JSON và application/json)
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    if (Array.isArray(payload)) {
      payload = { action: "addBatch", wishes: payload };
    } else if (!payload || typeof payload !== "object") {
      payload = {};
    }

    var action = payload.action || (payload.wish ? "addWish" : (payload.image ? "addPhoto" : "addWish"));
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Không tìm thấy Google Spreadsheet đang kích hoạt. Hãy bảo đảm bạn mở Apps Script từ menu Tiện ích mở rộng > Apps Script trong Google Trang tính.");
    }
    initSheetsIfNeeded(ss);

    // 2. Định tuyến theo hành động
    if (action === "addWish") {
      var resultWish = handleAddWish(ss, payload);
      return createJsonResponse({
        status: "success",
        message: "Đã lưu lời chúc thành công vào Google Sheet!",
        data: resultWish
      });
    }

    if (action === "addPhoto") {
      var resultPhoto = handleAddPhoto(ss, payload);
      return createJsonResponse({
        status: "success",
        message: "Đã lưu hình ảnh đóng góp thành công!",
        data: resultPhoto
      });
    }

    if (action === "addBatch") {
      var batchCount = handleAddBatch(ss, payload);
      return createJsonResponse({
        status: "success",
        message: "Đã đồng bộ hàng loạt thành công: " + batchCount + " mục!",
        count: batchCount
      });
    }

    if (action === "deleteWish" || action === "deletePhoto") {
      var deletedId = payload.id || "";
      var sheetName = (action === "deleteWish") ? SHEET_WISHES : SHEET_PHOTOS;
      var isDeleted = deleteItemById(ss, sheetName, deletedId);
      return createJsonResponse({
        status: isDeleted ? "success" : "not_found",
        message: isDeleted ? "Đã xóa mục khỏi Google Sheet!" : "Không tìm thấy ID tương ứng."
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Hành động (action) không hợp lệ: " + action
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "Lỗi xử lý yêu cầu POST: " + error.toString()
    });
  }
}

/**
 * Xử lý lưu lời chúc vào trang tính "Wishes"
 */
function handleAddWish(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_WISHES);
  if (!sheet) {
    initSheetsIfNeeded(ss);
    sheet = ss.getSheetByName(SHEET_WISHES);
  }
  var id = (payload.id && String(payload.id).trim()) ? String(payload.id).trim() : ("wish-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4));
  var author = (payload.author || "").toString().trim() || "Bạn học trò";
  var wish = (payload.wish || "").toString().trim();
  var time = (payload.time || "").toString().trim() || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm");
  var rawImage = payload.image || "";
  var imageUrl = "";

  if (!wish) {
    throw new Error("Nội dung lời chúc không được để trống!");
  }

  // Tối ưu hóa lưu trữ ảnh nếu có
  if (rawImage) {
    imageUrl = processImageStorage(rawImage, "wish_" + id, author);
  }

  var receivedAt = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");

  // Ghi hàng mới vào trang tính: ID | Thời Gian | Tác Giả | Lời Chúc | Hình Ảnh | Thời Điểm Nhận
  // Khử độc formula injection nếu nội dung bắt đầu bằng =, +, -, @
  sheet.appendRow([
    id,
    time,
    sanitizeSpreadsheetCell(author),
    sanitizeSpreadsheetCell(wish),
    imageUrl,
    receivedAt
  ]);

  return {
    id: id,
    time: time,
    author: author,
    wish: wish,
    image: imageUrl
  };
}

/**
 * Xử lý lưu ảnh đóng góp vào trang tính "Photos"
 */
function handleAddPhoto(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_PHOTOS);
  if (!sheet) {
    initSheetsIfNeeded(ss);
    sheet = ss.getSheetByName(SHEET_PHOTOS);
  }
  var id = (payload.id && String(payload.id).trim()) ? String(payload.id).trim() : ("photo-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4));
  var author = (payload.author || "").toString().trim() || "Bạn học trò";
  var caption = (payload.caption || "").toString().trim();
  var aspect = payload.aspect || "landscape";
  var time = (payload.time || "").toString().trim() || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm");
  var rawImage = payload.image || "";
  var imageUrl = "";

  if (!rawImage) {
    throw new Error("Dữ liệu hình ảnh không được để trống!");
  }

  imageUrl = processImageStorage(rawImage, "photo_" + id, author);
  var receivedAt = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");

  // Ghi hàng mới vào trang tính: ID | Thời Gian | Người Đóng Góp | Ghi Chú | URL Ảnh | Định Dạng | Thời Điểm Nhận
  // Khử độc formula injection nếu nội dung bắt đầu bằng =, +, -, @
  sheet.appendRow([
    id,
    time,
    sanitizeSpreadsheetCell(author),
    sanitizeSpreadsheetCell(caption),
    imageUrl,
    aspect,
    receivedAt
  ]);

  return {
    id: id,
    time: time,
    author: author,
    caption: caption,
    image: imageUrl,
    aspect: aspect
  };
}

/**
 * Xử lý lưu trữ hình ảnh tối ưu
 * Nếu là ảnh Base64: Tự động tải lên Google Drive, cấp quyền xem công khai và lưu URL gọn nhẹ.
 * Tránh lỗi giới hạn 50,000 ký tự / ô tính của Google Sheets.
 */
function processImageStorage(rawImage, prefix, author) {
  if (!rawImage || typeof rawImage !== "string") return "";
  rawImage = rawImage.trim();

  // Nếu đã là URL thông thường (http/https), giữ nguyên
  if (rawImage.indexOf("http://") === 0 || rawImage.indexOf("https://") === 0) {
    return rawImage;
  }

  // Nếu là Base64 Data URL (data:image/...)
  if (rawImage.toLowerCase().indexOf("data:image/") === 0) {
    try {
      var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
      var base64Index = rawImage.toLowerCase().indexOf(";base64,");
      if (base64Index === -1) {
        return rawImage.length > 45000 ? rawImage.substring(0, 45000) : rawImage;
      }

      var headerPart = rawImage.substring(0, base64Index);
      var base64Data = rawImage.substring(base64Index + 8).trim();
      var mimeType = headerPart.replace(/data:/i, "").split(";")[0].toLowerCase().trim() || "image/jpeg";

      var ext = "jpg";
      if (mimeType.indexOf("webp") !== -1) ext = "webp";
      else if (mimeType.indexOf("png") !== -1) ext = "png";

      var safeAuthor = (author || "Ban_hoc_tro").toString().replace(/[^a-zA-Z0-9]/g, "_");
      var fileName = prefix + "_" + safeAuthor + "." + ext;
      var decodedBytes = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      // Trả về link trực tiếp có thể xem trực tiếp trên web
      var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
      return directUrl;
    } catch (driveErr) {
      // Fallback: nếu không có quyền Drive hoặc lỗi, cắt ngắn an toàn dưới 45.000 ký tự
      if (rawImage.length > 45000) {
        return rawImage.substring(0, 45000);
      }
      return rawImage;
    }
  }

  return rawImage;
}

/**
 * Đọc toàn bộ danh sách lời chúc từ trang tính
 */
function readWishesFromSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_WISHES);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // Chỉ có dòng tiêu đề hoặc rỗng

  // Bảo đảm trang tính có tối thiểu 6 cột để tránh lỗi vượt biên kích thước range
  if (sheet.getMaxColumns() < 6) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 6 - sheet.getMaxColumns());
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  var wishes = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var id = String(row[0] || "").trim();
    var rawTime = row[1];
    var time = "";
    if (rawTime instanceof Date) {
      time = Utilities.formatDate(rawTime, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm");
    } else {
      time = String(rawTime || "").trim();
    }
    var rawAuthor = unsanitizeSpreadsheetCell(String(row[2] || "").trim());
    var rawWish = unsanitizeSpreadsheetCell(String(row[3] || "").trim());
    var rawImage = String(row[4] || "").trim();

    // Dòng trống hoàn toàn không có lời chúc hay ảnh thì bỏ qua để không sinh lời chúc ma
    if (!rawWish && !rawImage) {
      continue;
    }

    var author = rawAuthor || "Bạn học trò";
    var wish = rawWish;
    var image = rawImage;

    // Tự động gán ID phòng vệ nếu người dùng nhập tay trực tiếp trên Google Sheets mà bỏ trống cột ID
    if (!id && (author || wish)) {
      id = "wish-row-" + (i + 2);
      try {
        sheet.getRange(i + 2, 1).setValue(id);
      } catch (writeIdErr) {}
    }

    if (id && (wish || image)) {
      wishes.push({
        id: id,
        time: time,
        author: author,
        wish: wish,
        image: image
      });
    }
  }

  // Đảo ngược để lời chúc mới nhất nằm ở đầu danh sách
  wishes.reverse();
  return wishes;
}

/**
 * Đọc toàn bộ danh sách ảnh đóng góp từ trang tính
 */
function readPhotosFromSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_PHOTOS);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  // Bảo đảm trang tính có tối thiểu 7 cột để tránh lỗi vượt biên kích thước range
  if (sheet.getMaxColumns() < 7) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 7 - sheet.getMaxColumns());
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var photos = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var id = String(row[0] || "").trim();
    var rawTime = row[1];
    var time = "";
    if (rawTime instanceof Date) {
      time = Utilities.formatDate(rawTime, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm");
    } else {
      time = String(rawTime || "").trim();
    }
    var author = unsanitizeSpreadsheetCell(String(row[2] || "").trim()) || "Bạn học trò";
    var caption = unsanitizeSpreadsheetCell(String(row[3] || "").trim());
    var image = String(row[4] || "").trim();
    var aspect = String(row[5] || "").trim() || "landscape";

    // Bỏ qua dòng trống không có ảnh
    if (!image) {
      continue;
    }

    // Tự động gán ID phòng vệ nếu nhập ảnh trực tiếp trên Google Sheets mà bỏ trống cột ID
    if (!id && image) {
      id = "photo-row-" + (i + 2);
      try {
        sheet.getRange(i + 2, 1).setValue(id);
      } catch (writeIdErr) {}
    }

    if (id && image) {
      photos.push({
        id: id,
        time: time,
        author: author,
        caption: caption,
        image: image,
        aspect: aspect
      });
    }
  }

  photos.reverse();
  return photos;
}

/**
 * Xóa một mục theo ID trong trang tính
 */
function deleteItemById(ss, sheetName, id) {
  if (!id) return false;
  var targetId = String(id).trim();
  if (!targetId) return false;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  var prefix = (sheetName === SHEET_PHOTOS) ? "photo" : "wish";
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    var cellId = String(ids[i][0] || "").trim();
    var fallbackId = prefix + "-row-" + (i + 2);
    // Hỗ trợ xóa cả ID thực và ID fallback tạo theo số dòng
    if (cellId === targetId || (!cellId && fallbackId === targetId)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

/**
 * Đồng bộ hàng loạt nhiều mục
 */
function handleAddBatch(ss, payload) {
  var count = 0;
  var wishes = payload.wishes || [];
  var photos = payload.photos || [];

  if (Array.isArray(wishes)) {
    for (var i = 0; i < wishes.length; i++) {
      try {
        handleAddWish(ss, wishes[i]);
        count++;
      } catch (e) {}
    }
  }

  if (Array.isArray(photos)) {
    for (var j = 0; j < photos.length; j++) {
      try {
        handleAddPhoto(ss, photos[j]);
        count++;
      } catch (e) {}
    }
  }

  return count;
}

/**
 * Tự động tạo trang tính và định dạng tiêu đề nếu trang tính chưa tồn tại
 */
function initSheetsIfNeeded(ss) {
  // 1. Tạo trang tính Wishes
  var wishSheet = ss.getSheetByName(SHEET_WISHES);
  if (!wishSheet) {
    wishSheet = ss.insertSheet(SHEET_WISHES);
  }
  if (wishSheet.getLastRow() === 0) {
    var wishHeaders = [
      "ID",
      "Thời Gian",
      "Tác Giả",
      "Lời Chúc Tri Ân",
      "URL Hình Ảnh",
      "Thời Điểm Nhận Hệ Thống"
    ];
    wishSheet.appendRow(wishHeaders);

    // Định dạng dòng tiêu đề trang trọng
    var headerRange = wishSheet.getRange(1, 1, 1, wishHeaders.length);
    headerRange.setBackground("#1e293b");
    headerRange.setFontColor("#f8fafc");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    wishSheet.setFrozenRows(1);
    wishSheet.autoResizeColumns(1, wishHeaders.length);
  }

  // 2. Tạo trang tính Photos
  var photoSheet = ss.getSheetByName(SHEET_PHOTOS);
  if (!photoSheet) {
    photoSheet = ss.insertSheet(SHEET_PHOTOS);
  }
  if (photoSheet.getLastRow() === 0) {
    var photoHeaders = [
      "ID",
      "Thời Gian",
      "Người Đóng Góp",
      "Ghi Chú",
      "URL / Dữ Liệu Hình Ảnh",
      "Định Dạng (Aspect)",
      "Thời Điểm Nhận Hệ Thống"
    ];
    photoSheet.appendRow(photoHeaders);

    var photoHeaderRange = photoSheet.getRange(1, 1, 1, photoHeaders.length);
    photoHeaderRange.setBackground("#1e293b");
    photoHeaderRange.setFontColor("#f8fafc");
    photoHeaderRange.setFontWeight("bold");
    photoHeaderRange.setHorizontalAlignment("center");
    photoSheet.setFrozenRows(1);
    photoSheet.autoResizeColumns(1, photoHeaders.length);
  }
}

/**
 * Tìm hoặc tạo thư mục trên Google Drive
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  while (folders.hasNext()) {
    var folder = folders.next();
    if (!folder.isTrashed()) {
      return folder;
    }
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Khử độc dữ liệu ô tính để chống lỗi công thức và CSV / Formula Injection
 * Nếu chuỗi bắt đầu bằng '=', '+', '-', '@' thì chèn dấu nháy đơn (') phía trước
 */
function sanitizeSpreadsheetCell(value) {
  if (value === null || value === undefined) return "";
  var str = String(value);
  var trimmed = str.trim();
  if (trimmed.length > 0 && (trimmed[0] === '=' || trimmed[0] === '+' || trimmed[0] === '-' || trimmed[0] === '@')) {
    return "'" + str;
  }
  return str;
}

/**
 * Khôi phục dữ liệu ô tính khi đọc ra nếu đã được khử độc trước đó
 */
function unsanitizeSpreadsheetCell(value) {
  if (value === null || value === undefined) return "";
  var str = String(value);
  if (str.length > 1 && str[0] === "'") {
    var nextChar = str[1];
    if (nextChar === '=' || nextChar === '+' || nextChar === '-' || nextChar === '@') {
      return str.substring(1);
    }
  }
  return str;
}

/**
 * Trả về phản hồi JSON hoặc JSONP với header CORS đầy đủ
 */
function createJsonResponse(data, callback) {
  var jsonString = JSON.stringify(data);
  var output;

  // Kiểm tra tên callback JSONP an toàn (chỉ cho phép ký tự định danh JavaScript hợp lệ)
  if (callback && typeof callback === "string" && /^[a-zA-Z0-9_$.]+$/.test(callback.trim())) {
    output = ContentService.createTextOutput(callback.trim() + "(" + jsonString + ");");
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    output = ContentService.createTextOutput(jsonString);
    output.setMimeType(ContentService.MimeType.JSON);
  }

  return output;
}
