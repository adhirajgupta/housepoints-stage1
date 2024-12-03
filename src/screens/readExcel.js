import * as XLSX from "xlsx";
import { addPoints, uploadExcelDataToFirestore } from "./firebaseFunctions"; // Assuming the upload function is in this file

export const readExcelFile = (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });

				// Select the first sheet
				const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
				const explorersSheet1 = firstSheet["J4"] ? firstSheet["J4"].v : null;
				const discoverersSheet1 = firstSheet["K4"] ? firstSheet["K4"].v : null;
				const voyagersSheet1 = firstSheet["L4"] ? firstSheet["L4"].v : null;
				const pioneersSheet1 = firstSheet["M4"] ? firstSheet["M4"].v : null;
				getPointDivision(firstSheet)
				if (
					explorersSheet1 === null ||
					discoverersSheet1 === null ||
					voyagersSheet1 === null ||
					pioneersSheet1 === null
				) {
					reject("One or more cells are empty in the first sheet. Please check the Excel file.");
					return;
				}

				// Select the second sheet
				const secondSheet = workbook.Sheets[workbook.SheetNames[1]];
				if (!secondSheet) {
					reject("The second sheet is missing in the Excel file.");
					return;
				}

				const explorersSheet2 = secondSheet["J4"] ? secondSheet["J4"].v : null;
				const discoverersSheet2 = secondSheet["K4"] ? secondSheet["K4"].v : null;
				const voyagersSheet2 = secondSheet["L4"] ? secondSheet["L4"].v : null;
				const pioneersSheet2 = secondSheet["M4"] ? secondSheet["M4"].v : null;

				if (
					explorersSheet2 === null ||
					discoverersSheet2 === null ||
					voyagersSheet2 === null ||
					pioneersSheet2 === null
				) {
					reject("One or more cells are empty in the second sheet. Please check the Excel file.");
					return;
				}

				// Call the function to upload data to Firestore
				uploadExcelDataToFirestore(
					{
						explorers: explorersSheet1,
						discoverers: discoverersSheet1,
						voyagers: voyagersSheet1,
						pioneers: pioneersSheet1,
					},
					{
						explorers: explorersSheet2,
						discoverers: discoverersSheet2,
						voyagers: voyagersSheet2,
						pioneers: pioneersSheet2,
					}
				)
					.then(() => {
						resolve("Data uploaded successfully from both sheets!");
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


const getPointDivision = (sheet) => {
    const currentSheet = sheet;

    // Function to replicate merged cell values
    const fillMergedCells = (sheet) => {
        const merges = sheet["!merges"] || [];
        for (const merge of merges) {
            const startRow = merge.s.r;
            const endRow = merge.e.r;
            const startCol = merge.s.c;

            // Get the starting cell value
            const cellAddress = String.fromCharCode(65 + startCol) + (startRow + 1); // e.g., A4
            const cellValue = sheet[cellAddress]?.v || null;

            // Fill all cells in the range with the starting cell value
            for (let row = startRow + 1; row <= endRow + 1; row++) {
                const targetCell = String.fromCharCode(65 + startCol) + row;
                if (!sheet[targetCell]) {
                    sheet[targetCell] = { v: cellValue };
                }
            }
        }
    };

    // Fill merged cells with values
    fillMergedCells(currentSheet);

    // Process the sheet as usual
    for (let i = 4; i < 54; i++) {
        if (currentSheet["F" + i] && currentSheet["F" + i].v) {
            // Extract cell values safely
            const pointCategory = currentSheet["A" + i]?.v + " " + currentSheet["E" + i]?.v || "Unknown";
            const source = "Excel sheet";
            const description = currentSheet["D" + i]?.v || "No description provided";

            // Use convertCodeToHouse safely
            const houseF = convertCodeToHouse(currentSheet["F" + i]?.v || "");
            const houseG = convertCodeToHouse(currentSheet["G" + i]?.v || "");
            const houseH = convertCodeToHouse(currentSheet["H" + i]?.v || "");
            const houseI = convertCodeToHouse(currentSheet["I" + i]?.v || "");

            // Add points
            addPoints(pointCategory, source, description, houseF, 1, 20, null, null);
            addPoints(pointCategory, source, description, houseG, 2, 15, null, null);
            addPoints(pointCategory, source, description, houseH, 3, 10, null, null);
            addPoints(pointCategory, source, description, houseI, 4, 5, null, null);
        } else {
            console.log(`Skipping row ${i}: No valid data in column F`);
        }
    }
};

const convertCodeToHouse = (code) => {
	switch (code) {
		case "EXP":
			return "Explorers"
		case "DIS":
			return "Discoverers"
		case "PIO":
			return "Pioneers"
		case "VOY":
			return "Voyagers"

	}
}