import * as XLSX from "xlsx";
import { uploadExcelDataToFirestore } from "./firebaseFunctions"; // Assuming the upload function is in this file

export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Select the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Extract the value from specific cells
        const explorers = worksheet["J4"] ? worksheet["J4"].v : null;
        const discoverers = worksheet["K4"] ? worksheet["K4"].v : null;
        const voyagers = worksheet["L4"] ? worksheet["L4"].v : null;
        const pioneers = worksheet["M4"] ? worksheet["M4"].v : null;

        // Check if all the required fields have data
        if (explorers === null || discoverers === null || voyagers === null || pioneers === null) {
          reject("One or more cells are empty. Please check the Excel file.");
          return;
        }

        // Call the function to upload data to Firestore
        uploadExcelDataToFirestore(explorers, discoverers, voyagers, pioneers)
          .then(() => {
            console.log("Data uploaded successfully from readExcelFile!");
            resolve("Data uploaded successfully!");
          })
          .catch((error) => {
            reject("Error uploading data to Firestore: " + error.message);
          });
      } catch (error) {
        reject("Error reading Excel file: " + error.message);
      }
    };

    reader.onerror = (error) => reject("File reading error: " + error.message);

    // Read the Excel file
    reader.readAsArrayBuffer(file);
  });
};
