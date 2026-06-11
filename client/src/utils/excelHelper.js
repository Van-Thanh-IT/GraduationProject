import * as XLSX from 'xlsx';

/**
 * Hàm đọc file Excel/CSV và trích xuất dữ liệu từ cột A
 * @param {File} file - File được upload từ thẻ input
 * @returns {Promise<string[]>} - Mảng chứa các chuỗi Serial/IMEI
 */
export const extractSerialsFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        const validExt = ['xlsx', 'xls', 'csv'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!validExt.includes(fileExt)) {
            return reject(new Error("Chỉ hỗ trợ upload file định dạng Excel (.xlsx, .xls) hoặc CSV!"));
        }

        const reader = new FileReader();
        
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                // Lấy dữ liệu cột A (index 0), loại bỏ dòng trống
                const importedSerials = data
                    .map(row => row[0]) 
                    .filter(item => item !== undefined && item !== null && String(item).trim() !== '')
                    .map(item => String(item).trim());

                if (importedSerials.length === 0) {
                    return reject(new Error("File Excel không có dữ liệu ở cột A!"));
                }

                resolve(importedSerials);
            } catch (error) {
                reject(new Error("Đọc file thất bại! Dữ liệu bị hỏng hoặc sai định dạng."));
            }
        };

        reader.onerror = () => reject(new Error("Lỗi hệ thống khi đọc file!"));
        reader.readAsBinaryString(file);
    });
};