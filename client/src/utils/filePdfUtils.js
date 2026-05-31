// File: src/utils/fileUtils.js

/**
 * Hàm chung xử lý tải file từ API Response
 * @param {any} data - Dữ liệu file (Thường là Blob hoặc Buffer)
 * @param {string} defaultFileName - Tên file mặc định nếu Backend không trả về headers
 * @param {string} mimeType - Định dạng file (VD: 'application/pdf', 'application/vnd.ms-excel')
 * @param {object} headers - Headers từ response của Axios để lấy tên file động
 */
export const downloadFileFromResponse = (data, defaultFileName, mimeType = 'application/pdf', headers = null) => {
  // 1. Tạo Blob từ data
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  // 2. Tìm tên file từ Headers (nếu có)
  let fileName = defaultFileName;
  if (headers && headers['content-disposition']) {
    const contentDisposition = headers['content-disposition'];
    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (fileNameMatch && fileNameMatch.length === 2) {
      fileName = fileNameMatch[1];
    }
  }

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  
  link.click();
  
  // 4. Dọn dẹp bộ nhớ
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const openFileInNewTab = (data, mimeType = 'application/pdf') => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
};