import React, { useState } from 'react';
import './App.css';
import AdminPanel from './screens/AdminPanel';
import UploadExcel from './screens/UploadExcel';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

function App() {
  const [open, setOpen] = useState(true); // To handle initial dialog
  const [showUploadExcel, setShowUploadExcel] = useState(false); // Toggle Excel dialog
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Toggle Admin Panel

  const handleInitialDialogClose = () => setOpen(false);

  const handleUploadExcel = () => {
    setShowUploadExcel(true); // Open the Excel upload dialog
  };

  const handleManualUpload = () => {
    setOpen(false); // Close the initial dialog
    setShowAdminPanel(true); // Show the Admin Panel
  };

  return (
    <div className="App">
      {/* Initial Dialog to Choose Between Excel or Manual Upload */}
      <Dialog open={open} onClose={handleInitialDialogClose}>
        <DialogTitle>Choose Upload Option</DialogTitle>
        <DialogContent>
          <Typography>Would you like to upload an Excel file or enter data manually?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadExcel} color="primary">
            Upload Excel
          </Button>
          <Button onClick={handleManualUpload} color="primary">
            Upload Manually
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conditionally Render UploadExcel Dialog */}
      {showUploadExcel && (
        <UploadExcel
          open={showUploadExcel}
          onClose={() => setShowUploadExcel(false)}
          setShowUploadExcel={setShowUploadExcel}
        />
      )}

      {/* Conditionally Render AdminPanel */}
      {showAdminPanel && <AdminPanel />}
    </div>
  );
}

export default App;
