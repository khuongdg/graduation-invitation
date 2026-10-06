// DÁN ID FILE GOOGLE SLIDES MẪU CỦA BẠN VÀO ĐÂY
var TEMPLATE_SLIDE_ID = "16thDuNUucPHDlaq2IHniEdovOaU_jyUoHzX5p6HpJhs"; 

function doGet(e) {
  try {
    var action = e.parameter ? e.parameter.action : null;
    
    // ================================================================
    // 1. CHỨC NĂNG CHO SECTION 2 (MY JOURNEY - SHEET "Hành trình")
    // ================================================================
    if (action === "getJourney") {
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "journeyPhotos": getJourneyPhotos() 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "saveJourney") {
      var id = e.parameter.id || String(new Date().getTime());
      var title = e.parameter.title || "";
      var caption = e.parameter.caption || "";
      var imageUrl = e.parameter.image || "";
      var isFeatured = e.parameter.isFeatured || "false";
      
      saveJourneyToSheet(id, title, caption, imageUrl, isFeatured);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "journeyPhotos": getJourneyPhotos()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "deleteJourney") {
      var id = e.parameter.id;
      var imageUrl = e.parameter.image;
      
      var deleted = deleteJourneyFromSheet(id, imageUrl);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "deleted": deleted,
        "journeyPhotos": getJourneyPhotos()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "toggleStarJourney") {
      var id = e.parameter.id;
      var isFeatured = e.parameter.isFeatured;
      
      var updated = toggleStarJourneyInSheet(id, isFeatured);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "updated": updated,
        "journeyPhotos": getJourneyPhotos()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ================================================================
    // 2. CHỨC NĂNG CHO SECTION 5 (MEMORY WALL - SHEET "Kỷ niệm")
    // ================================================================
    if (action === "getMemories") {
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "memories": getMemories() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "saveMemory") {
      var name = e.parameter.name;
      var caption = e.parameter.caption;
      var imageUrl = e.parameter.image;
      
      saveMemoryToSheet(name, caption, imageUrl);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "memories": getMemories()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "deleteMemory") {
      var id = e.parameter.id;
      var imageUrl = e.parameter.image;
      
      var deleted = deleteMemoryFromSheet(id, imageUrl);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "deleted": deleted,
        "memories": getMemories()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getRegistrations" || action === "getRsvp") {
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "registrations": getRegistrations() 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "deleteRegistration") {
      var id = e.parameter.id;
      var email = e.parameter.email;
      var phone = e.parameter.phone;
      
      var deleted = deleteRegistrationFromSheet(id, email, phone);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "success": true, 
        "deleted": deleted,
        "registrations": getRegistrations()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ================================================================
    // 3. MẶC ĐỊNH: XỬ LÝ ĐĂNG KÝ NHẬN THIỆP / XÁC NHẬN THAM GIA (RSVP)
    // ================================================================
    if (e.parameter && e.parameter.name) {
      return handleRsvpRegistration(e);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      "success": true, 
      "memories": getMemories() 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "success": false, 
      "error": err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------------------------------------------------------
// HÀM XỬ LÝ ĐĂNG KÝ XÁC NHẬN THAM GIA (RSVP - SHEET "Đăng ký")
// ----------------------------------------------------------------
function handleRsvpRegistration(e) {
  try {
    var name = e.parameter.name || "";
    var rawPhone = e.parameter.phone || "";
    var email = e.parameter.email || "";
    var status = e.parameter.status || "Xác nhận tham gia";
    
    var phone = rawPhone ? ("'" + rawPhone.toString().trim()) : "";
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Đăng ký");
    
    if (!sheet) {
      sheet = ss.insertSheet("Đăng ký");
      sheet.appendRow(["STT", "Họ và tên", "Số điện thoại", "Email", "Trạng thái", "Thời gian đăng ký"]);
    }
    
    var lastRow = sheet.getLastRow();
    var stt = lastRow <= 0 ? 1 : lastRow;
    
    if (lastRow === 0) {
      sheet.appendRow(["STT", "Họ và tên", "Số điện thoại", "Email", "Trạng thái", "Thời gian đăng ký"]);
      stt = 1;
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss dd/MM/yyyy");
    
    sheet.appendRow([stt, name, phone, email, status, timeStr]);
    
    var emailSent = false;
    if (email && email.trim() !== "" && status === "Xác nhận tham gia") {
      emailSent = generateAndSendInvitation(name, email);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "success": true, 
      "message": "Đã ghi nhận đăng ký thành công!",
      "stt": stt,
      "emailSent": emailSent
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("Lỗi handleRsvpRegistration: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      "success": false, 
      "error": err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------------------------------------------------------
// HÀM LẤY DANH SÁCH ẢNH SECTION 2 TỪ SHEET "Hành trình"
// ----------------------------------------------------------------
function getJourneyPhotos() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Hành trình");
    if (!sheet) {
      sheet = ss.insertSheet("Hành trình");
      sheet.appendRow(["ID", "Tiêu đề", "Mô tả", "Đường dẫn ảnh", "Nổi bật (5 sao)", "Thời gian"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
      return [];
    }
    var data = sheet.getDataRange().getValues();
    var photos = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[3] && row[3].toString().trim() !== "") {
        var timeVal = "";
        if (row[5]) {
          if (row[5] instanceof Date) {
            timeVal = Utilities.formatDate(row[5], "GMT+7", "HH:mm:ss dd/MM/yyyy");
          } else {
            timeVal = row[5].toString().trim();
          }
        }
        photos.push({
          id: row[0] || (i + 1),
          title: row[1] || "",
          caption: row[2] || "",
          imageUrl: row[3].toString().trim(),
          isFeatured: row[4] ? (row[4].toString().toLowerCase() === "true") : false,
          timestamp: timeVal
        });
      }
    }
    return photos;
  } catch (err) {
    Logger.log("Lỗi getJourneyPhotos: " + err.toString());
    return [];
  }
}

// ----------------------------------------------------------------
// HÀM LƯU ẢNH SECTION 2 VÀO SHEET "Hành trình"
// ----------------------------------------------------------------
function saveJourneyToSheet(id, title, caption, imageUrl, isFeatured) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Hành trình");
    
    if (!sheet) {
      sheet = ss.insertSheet("Hành trình");
      sheet.appendRow(["ID", "Tiêu đề", "Mô tả", "Đường dẫn ảnh", "Nổi bật (5 sao)", "Thời gian"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    }
    
    var photoId = id || String(new Date().getTime());
    var featStatus = isFeatured ? isFeatured.toString() : "false";
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss dd/MM/yyyy");
    
    sheet.appendRow([photoId, title, caption, imageUrl, featStatus, timeStr]);
  } catch (err) {
    Logger.log("Lỗi saveJourneyToSheet: " + err.toString());
  }
}

// ----------------------------------------------------------------
// HÀM XÓA ẢNH SECTION 2 TRONG SHEET "Hành trình"
// ----------------------------------------------------------------
function deleteJourneyFromSheet(id, imageUrl) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Hành trình");
    if (!sheet) return false;
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return false;
    
    var targetId = id ? id.toString().trim() : "";
    var targetUrl = imageUrl ? imageUrl.toString().trim() : "";
    
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var rowId = row[0] ? row[0].toString().trim() : "";
      var rowImage = row[3] ? row[3].toString().trim() : "";
      
      var matchesUrl = targetUrl && rowImage === targetUrl;
      var matchesId = targetId && rowId === targetId;
      
      if (matchesUrl || matchesId) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log("Lỗi deleteJourneyFromSheet: " + err.toString());
    return false;
  }
}

// ----------------------------------------------------------------
// HÀM BẬT/TẮT 5 SAO (FEATURED) CHO SECTION 2 TRONG SHEET "Hành trình"
// ----------------------------------------------------------------
function toggleStarJourneyInSheet(id, isFeatured) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Hành trình");
    if (!sheet) return false;
    
    var data = sheet.getDataRange().getValues();
    var targetId = id ? id.toString().trim() : "";
    
    for (var i = 1; i < data.length; i++) {
      var rowId = data[i][0] ? data[i][0].toString().trim() : "";
      if (rowId === targetId) {
        sheet.getRange(i + 1, 5).setValue(isFeatured ? isFeatured.toString() : "false");
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log("Lỗi toggleStarJourneyInSheet: " + err.toString());
    return false;
  }
}

// ----------------------------------------------------------------
// HÀM LẤY DANH SÁCH ẢNH KỶ NIỆM TỪ SHEET "Kỷ niệm" (SECTION 5)
// ----------------------------------------------------------------
function getMemories() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Kỷ niệm") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var memories = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var nameVal = row[0] ? row[0].toString().trim() : "";
      var captionVal = row[1] ? row[1].toString().trim() : "";
      var imageVal = row[2] ? row[2].toString().trim() : "";
      
      if (nameVal !== "" || captionVal !== "" || imageVal !== "") {
        var timeVal = "";
        if (row[3]) {
          if (row[3] instanceof Date) {
            timeVal = Utilities.formatDate(row[3], "GMT+7", "HH:mm:ss dd/MM/yyyy");
          } else {
            timeVal = row[3].toString().trim();
          }
        }
        memories.push({
          id: i,
          name: nameVal || "Người thương",
          caption: captionVal || "",
          imageUrl: imageVal,
          timestamp: timeVal
        });
      }
    }
    return memories;
  } catch (err) {
    Logger.log("Lỗi getMemories: " + err.toString());
    return [];
  }
}

// ----------------------------------------------------------------
// HÀM LƯU ẢNH KỶ NIỆM VÀO SHEET "Kỷ niệm" (SECTION 5)
// ----------------------------------------------------------------
function saveMemoryToSheet(name, caption, imageUrl) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Kỷ niệm");
    
    if (!sheet) {
      sheet = ss.insertSheet("Kỷ niệm");
      sheet.appendRow(["Họ tên", "Lời chúc", "Đường dẫn ảnh", "Thời gian"]);
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm:ss dd/MM/yyyy");
    sheet.appendRow([name, caption, imageUrl, timeStr]);
  } catch (err) {
    Logger.log("Lỗi saveMemoryToSheet: " + err.toString());
  }
}

// ----------------------------------------------------------------
// HÀM XÓA ẢNH KỶ NIỆM TRONG SHEET "Kỷ niệm" (SECTION 5)
// ----------------------------------------------------------------
function deleteMemoryFromSheet(id, imageUrl) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Kỷ niệm") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return false;
    
    var targetId = id ? parseInt(id, 10) : null;
    var targetUrl = imageUrl ? imageUrl.toString().trim() : "";
    
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var rowId = i;
      var rowImage = row[2] ? row[2].toString().trim() : "";
      
      var matchesUrl = targetUrl && rowImage === targetUrl;
      var matchesId = targetId && rowId === targetId;
      
      if (matchesUrl || matchesId) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log("Lỗi deleteMemoryFromSheet: " + err.toString());
    return false;
  }
}

// ----------------------------------------------------------------
// HÀM TẠO VÀ GỬI THIỆP MỜI PDF QUA GMAIL
// ----------------------------------------------------------------
function generateAndSendInvitation(name, email) {
  try {
    var templateFile = DriveApp.getFileById(TEMPLATE_SLIDE_ID);
    var tempFile = templateFile.makeCopy("Thiep_Moi_" + name);
    var tempSlideId = tempFile.getId();
    
    var presentation = SlidesApp.openById(tempSlideId);
    presentation.replaceAllText("{{Name}}", name);
    presentation.saveAndClose();
    
    var pdfBlob = tempFile.getAs("application/pdf");
    pdfBlob.setName("Thiep_Moi_Graduation_" + name + ".pdf");
    
    var subject = "✨ Thư mời Lễ Tốt Nghiệp của Khương gửi đến " + name + " ✨";
    var body = "Chào " + name + ",\n\n" +
               "Mình mong được gửi đến bạn thư mời chính thức tham dự Lễ Tốt Nghiệp của mình.\n" +
               "Thông tin chi tiết được đính kèm trong thiệp mời (file PDF) dưới đây.\n\n" +
               "Sự hiện diện của bạn là niềm vinh hạnh lớn đối với mình! Rất mong được gặp bạn để cùng chia sẻ khoảnh khắc ý nghĩa này! ✨\n\n" +
               "Trân trọng,\n" +
               "Nhựt Khương";
               
    GmailApp.sendEmail(email, subject, body, {
      attachments: [pdfBlob],
      name: "Dương Nhựt Khương"
    });
    
    DriveApp.getFileById(tempSlideId).setTrashed(true);
    return true;
  } catch (err) {
    Logger.log("Lỗi gửi mail: " + err.toString());
    return false;
  }
}

// ----------------------------------------------------------------
// HÀM LẤY DANH SÁCH KHÁCH MỜI ĐĂNG KÝ (RSVP) TỪ SHEET "Đăng ký"
// ----------------------------------------------------------------
function getRegistrations() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Đăng ký");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1] && row[1].toString().trim() !== "") {
        var timeVal = "";
        if (row[5]) {
          if (row[5] instanceof Date) {
            timeVal = Utilities.formatDate(row[5], "GMT+7", "HH:mm:ss dd/MM/yyyy");
          } else {
            timeVal = row[5].toString().trim();
          }
        }
        var rawPhone = row[2] ? row[2].toString().replace(/^'/, '').trim() : "";
        list.push({
          id: row[0] || i,
          name: row[1].toString().trim(),
          phone: rawPhone,
          email: row[3] ? row[3].toString().trim() : "",
          status: row[4] ? row[4].toString().trim() : "Xác nhận tham gia",
          timestamp: timeVal
        });
      }
    }
    return list;
  } catch (err) {
    Logger.log("Lỗi getRegistrations: " + err.toString());
    return [];
  }
}

// ----------------------------------------------------------------
// HÀM XÓA KHÁCH MỜI ĐĂNG KÝ TRONG SHEET "Đăng ký"
// ----------------------------------------------------------------
function deleteRegistrationFromSheet(id, email, phone) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Đăng ký");
    if (!sheet) return false;
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return false;
    
    var targetId = id ? id.toString().trim() : "";
    var targetEmail = email ? email.toString().trim().toLowerCase() : "";
    var targetPhone = phone ? phone.toString().replace(/^'/, '').trim() : "";
    
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var rowId = row[0] ? row[0].toString().trim() : "";
      var rowPhone = row[2] ? row[2].toString().replace(/^'/, '').trim() : "";
      var rowEmail = row[3] ? row[3].toString().trim().toLowerCase() : "";
      
      var matchesId = targetId && rowId === targetId;
      var matchesEmail = targetEmail && rowEmail === targetEmail;
      var matchesPhone = targetPhone && rowPhone === targetPhone;
      
      if (matchesId || matchesEmail || matchesPhone) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log("Lỗi deleteRegistrationFromSheet: " + err.toString());
    return false;
  }
}
