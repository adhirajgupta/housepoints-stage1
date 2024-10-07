import React, { useState } from "react";
import { readExcelFile } from "./readExcel";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";

function UploadExcel({ open, onClose, setShowUploadExcel }) {
  const [file, setFile] = useState(null);

  // Handle Excel file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to run once the file is confirmed for upload
  const handleConfirmUpload = () => {
    if (file) {
      readExcelFile(file)
        .then(() => {
          alert("Data successfully added to Firebase!");
          setShowUploadExcel(false); // Hide the dialog after a successful upload
        })
        .catch((error) => {
          alert("An error occurred: " + error);
        });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload Excel File</DialogTitle>
      <DialogContent>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        {file && (
          <Typography sx={{ marginTop: 2 }}>
            File Selected: {file.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleConfirmUpload}
          color="primary"
          disabled={!file} // Enable only if a file is selected
        >
          Confirm Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadExcel;
