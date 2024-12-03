import { getFirestore, collection, getDocs, addDoc, doc, getDoc, deleteDoc, setDoc, } from 'firebase/firestore';
import { app } from '../config'
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { readExcelFile } from './readExcel';
// Initialize Firestore
const storage = getStorage();
const db = getFirestore(app);

// Function to get all documents from the "Event_Points" collection
export async function getAllEvents() {
	try {
		const eventPointsCollectionRef = collection(db, 'Event_Points');
		const querySnapshot = await getDocs(eventPointsCollectionRef);
		const eventPoints = [];
		querySnapshot.forEach((doc) => {
			eventPoints.push(doc.data().event);
		});
		return eventPoints;
	} catch (error) {
		console.error('Error getting documents:', error);
		throw error;
	}
}

// Function to get all documents from the "Event_Points" collection
// Function to get event points from Firestore
async function getEventPoints(event) {
	try {
		const eventDocRef = doc(db, 'Event_Points', event);
		const eventDocSnapshot = await getDoc(eventDocRef);

		if (eventDocSnapshot.exists()) {
			const eventPoints = [
				eventDocSnapshot.data().first,
				eventDocSnapshot.data().second,
				eventDocSnapshot.data().third,
				eventDocSnapshot.data().fourth
			];
			return eventPoints;
		} else {
			console.log('No such document!');
			return null;
		}
	} catch (error) {
		console.error('Error getting document:', error);
		throw error;
	}
}


// Function to create a document in a collection
async function createDocument(collectionName, data) {
	try {
		const docRef = await addDoc(collection(db, collectionName), data);
		console.log('Document written with ID:', docRef.id);
		return docRef.id;
	} catch (error) {
		console.error('Error adding document:', error);
		throw error;
	}
}
export async function addPoints(event, teacher, date, house, place, customPoints, division, gender) {
	try {
		// Set document name as the event
		const docRef = doc(db, house, event.replace('/','|')); // Specify the collection (house) and document ID (event)

		// Create or update the document with custom points
		await setDoc(docRef, {
			event: event,
			teacher: teacher,
			place: place,
			customPoints: parseInt(customPoints), // Convert custom points to integer
		});

		console.log(`Document for event "${event}" successfully written to "${house}" collection.`);
	} catch (error) {
		console.error("Error adding custom points:", error);
		throw error;
	}
}



export const deleteAllDocuments = async (collectionName) => {
	try {
		// Get all documents in the collection
		const querySnapshot = await getDocs(collection(db, collectionName));

		// Delete each document
		const deletePromises = [];
		querySnapshot.forEach((doc) => {
			deletePromises.push(deleteDoc(doc.ref));
		});

		// Wait for all delete operations to complete
		await Promise.all(deletePromises);

		console.log('All documents deleted successfully.');
	} catch (error) {
		console.error('Error deleting documents:', error);
	}
}



export const uploadExcelDataToFirestore = async (sheet1Data, sheet2Data) => {
	// const currentDateTime = new Date().toISOString().replace(/:/g, "-").split(".")[0];

	let b = new Date().toISOString().split('T')
	const currentDateTime = b[0] + "T" + b[1].replace('/', ':')


	// Sum up the points
	const summedData = {
		explorers: sheet1Data.explorers + sheet2Data.explorers,
		discoverers: sheet1Data.discoverers + sheet2Data.discoverers,
		voyagers: sheet1Data.voyagers + sheet2Data.voyagers,
		pioneers: sheet1Data.pioneers + sheet2Data.pioneers,
	};

	try {
		await setDoc(doc(db, "FileData", currentDateTime), {
			// Summed-up points
			Explorers: summedData.explorers,
			Discoverers: summedData.discoverers,
			Voyagers: summedData.voyagers,
			Pioneers: summedData.pioneers,

			// Individual points
			ExplorersSports: sheet1Data.explorers,
			DiscoverersSports: sheet1Data.discoverers,
			VoyagersSports: sheet1Data.voyagers,
			PioneersSports: sheet1Data.pioneers,

			ExplorersCultural: sheet2Data.explorers,
			DiscoverersCultural: sheet2Data.discoverers,
			VoyagersCultural: sheet2Data.voyagers,
			PioneersCultural: sheet2Data.pioneers,
		});
		console.log("Data uploaded to Firestore successfully!");
	} catch (error) {
		console.error("Error uploading data to Firestore: ", error);
		throw error;
	}
};
