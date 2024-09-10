import React, { useEffect, useState } from 'react';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MenuItem, Switch } from '@mui/material';
import { addPoints, getAllEvents } from './firebaseFunctions';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
const teachers = [
	{ name: 'Sujit Dutta' },
	{ name: 'Tarun Kumar Biswas' },
	{ name: 'Sonu Yadav' },
	{ name: 'Rabi Urang' },
	{ name: 'Vinod Kumar' },
	{ name: 'Leena Hatkar' },
	{ name: 'Neeta Thakre' },
	{ name: 'Manisha' }

];
function AdminPanel() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogContent, setDialogContent] = useState('');
	const [selectedAction, setSelectedAction] = useState(null);
	const [eventValue, setEventValue] = useState(null);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [selectedTeacher, setSelectedTeacher] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [customPoints, setCustomPoints] = useState(false);
	const [customEvent, setCustomEvent] = useState('');
	const [events, setEvents] = useState([]);
	const [housePositions, setHousePositions] = useState({
		Discoverers: null,
		Explorers: null,
		Voyagers: null,
		Pioneers: null
	}); // State to store positions for each house
	const [houseCustomPoints, setHouseCustomPoints] = useState({
		Discoverers: '',
		Explorers: '',
		Voyagers: '',
		Pioneers: ''
	}); // State to store custom points for each house

	useEffect(() => {
		async function fetchData() {
			try {
				const allEvents = await getAllEvents();
				const mappedEvents = allEvents.map(event => ({ label: event, value: event }));
				setEvents(mappedEvents);
			} catch (error) {
				console.error('Error fetching events:', error);
			}
		}
		fetchData();
	}, []);

	const handleDialogOpen = () => {
		setDialogOpen(true);
		setDialogContent(`Event: ${selectedEvent?.label}\nTeacher: ${selectedTeacher?.name}\nDate: ${selectedDate?.toISOString()}
${["Discoverers", "Explorers", "Voyagers", "Pioneers"]
				.map(val => `${val}: ${customPoints ? houseCustomPoints[val] : housePositions[val]}`)
				.join('\n')}`);

	};

	const handleDialogClose = async () => {
		setDialogOpen(false);
		try {
			await addPoints(
				selectedEvent?.value,
				selectedTeacher?.name,
				selectedDate,
				"Discoverers", // Currently hardcoded, you can make it dynamic if needed
				housePositions["Discoverers"], // Get position from state
				customPoints ? houseCustomPoints["Discoverers"] : false // Get custom points from state if custom points are enabled
			);
			await addPoints(
				selectedEvent?.value,
				selectedTeacher?.name,
				selectedDate,
				"Voyagers", // Currently hardcoded, you can make it dynamic if needed
				housePositions["Voyagers"], // Get position from state
				customPoints ? houseCustomPoints["Voyagers"] : false // Get custom points from state if custom points are enabled
			);
			await addPoints(
				selectedEvent?.value,
				selectedTeacher?.name,
				selectedDate,
				"Explorers", // Currently hardcoded, you can make it dynamic if needed
				housePositions["Explorers"], // Get position from state
				customPoints ? houseCustomPoints["Explorers"] : false // Get custom points from state if custom points are enabled
			);
			await addPoints(
				selectedEvent?.value,
				selectedTeacher?.name,
				selectedDate,
				"Pioneers", // Currently hardcoded, you can make it dynamic if needed
				housePositions["Pioneers"], // Get position from state
				customPoints ? houseCustomPoints["Pioneers"] : false // Get custom points from state if custom points are enabled
			);
			// Display success message
			alert("Points added successfully!");
		} catch (error) {
			// Display error message
			alert("Failed to add points: " + error.message);
			console.error('Error adding points:', error);
		}
	};


	const handlePerformAction = () => {
		handleDialogOpen();
		// Trigger Firebase functions here if needed
	};
	const handleEventInputChange = (event) => {
		setEventValue(event.target.value);
	};

	const handleTeacherChange = (event, newValue) => {
		setSelectedTeacher(newValue);
	};

	const handleDateChange = (newValue) => {
		setSelectedDate(newValue);
	};

	const handleAddPoints = () => {
		console.log('Add points button clicked:', selectedAction, eventValue);
	};

	const handleEventChange = (event, newValue) => {
		if (newValue && newValue.value === 'custom') {
			setCustomEvent('');
			return;
		}
		setSelectedEvent(newValue);
	};

	const handleHousePositionChange = (event, house) => {
		const newPosition = event.target.value;
		setHousePositions(prevState => ({
			...prevState,
			[house]: newPosition
		}));
	};

	const handleCustomPointsChange = (event, house) => {
		const newCustomPoints = event.target.value;
		setHouseCustomPoints(prevState => ({
			...prevState,
			[house]: newCustomPoints
		}));
	};

	const allFieldsFilled = selectedAction && eventValue && selectedEvent && selectedTeacher && selectedDate;

	return (
		<Box sx={{ mt: 4, mx: 'auto', maxWidth: '600px', padding: '0 20px' }}>
			<Typography variant="h4" align="center">
				House Points Portal
			</Typography>

			<Autocomplete
				options={[...events, { label: eventValue, value: eventValue }]}
				getOptionLabel={(option) => option.label}
				value={selectedEvent}
				onChange={handleEventChange}
				onInputChange={handleEventInputChange}
				renderInput={(params) => <TextField {...params} label="Events" />}
				sx={{ mt: 2 }}
			/>

			<Autocomplete
				options={teachers}
				getOptionLabel={(option) => option.name}
				value={selectedTeacher}
				onChange={handleTeacherChange}
				renderInput={(params) => <TextField {...params} label="Name of Teacher" />}
				sx={{ mt: 2 }}
			/>

			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<DatePicker
					label="Date"
					inputFormat="MM/dd/yyyy"
					value={selectedDate}
					onChange={handleDateChange}
					renderInput={(params) => <TextField {...params} />}
					sx={{ mt: 2 }}
				/>
			</LocalizationProvider>

			<Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
				<Typography>
					Custom Points:
				</Typography>
				<Switch
					checked={customPoints}
					onChange={() => setCustomPoints(!customPoints)}
					color="primary"
					sx={{ ml: 2 }}
				/>
			</Box>

			{["Discoverers", "Explorers", "Voyagers", "Pioneers"].map((val, index) => (
				<Box key={index} sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
					<Typography>
						{val} :
					</Typography>
					<TextField
						select
						label={`Position`}
						variant="outlined"
						value={housePositions[val]} // Set value from state
						onChange={(event) => handleHousePositionChange(event, val)} // Pass house name to handle function
						sx={{ ml: 2, width: 200 }}
					>
						<MenuItem value={1}>1st place</MenuItem>
						<MenuItem value={2}>2nd place</MenuItem>
						<MenuItem value={3}>3rd place</MenuItem>
						<MenuItem value={4}>4th place</MenuItem>
					</TextField>
					{customPoints && (
						<TextField
							label="Custom Points"
							variant="outlined"
							type="number"
							value={houseCustomPoints[val]} // Set value from state
							onChange={(event) => handleCustomPointsChange(event, val)} // Pass house name to handle function
							sx={{ ml: 2, width: 150 }}
						/>
					)}
				</Box>
			))}

			<Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
				<Button
					variant="contained"
					onClick={handlePerformAction}
				>
					Perform Action
				</Button>
			</Box>

			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				aria-labelledby="dialog-title"
				aria-describedby="dialog-description"
			>
				<DialogTitle id="dialog-title">Confirm Action</DialogTitle>
				<DialogContent>
					<DialogContentText id="dialog-description">
						{dialogContent}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDialogClose}>Confirm</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default AdminPanel;
