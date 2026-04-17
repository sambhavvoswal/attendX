import * as XLSX from 'xlsx';

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON (array of objects)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          reject(new Error("The uploaded file is empty."));
          return;
        }

        // Extract headers from the first object
        const headers = Object.keys(jsonData[0]);

        resolve({
          headers,
          rows: jsonData
        });
      } catch (err) {
        reject(new Error("Failed to parse the Excel file. Please ensure it's a valid format."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    reader.readAsBinaryString(file);
  });
};
