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
  if (customPoints) {
    try {
      // Create document with custom points
      await createDocument(house, {
        event: event,
        teacher: teacher,
        date: date.toISOString(), // Convert date to ISO string
        place: place,
        customPoints: parseInt(customPoints), // Convert custom points to integer
        division: division, // Add division
        gender: gender // Add gender
      });
    } catch (error) {
      console.error('Error adding custom points:', error);
      throw error;
    }
  } else {
    try {
      // Fetch event points
      const eventPoints = await getEventPoints(event);
      console.log(eventPoints);

      // Check if event points are retrieved successfully
      if (eventPoints) {
        // Get the points for the specified place
        const points = eventPoints[parseInt(place) - 1];
        console.log(points);

        // Create document with the retrieved data
        await createDocument(house, {
          event: event,
          teacher: teacher,
          date: date.toISOString(), // Convert date to ISO string
          place: place,
          points: parseInt(points),
          division: division, // Add division
          gender: gender // Add gender
        });
      } else {
        console.log('Failed to retrieve event points.');
      }
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }
}


export const deleteAllDocuments = async (collectionName) => {
  try {
    // Get all documents in the collection
    const querySnapshot = await getDocs(collection(db, "Voyagers"));

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



export const uploadExcelDataToFirestore = async (explorers, discoverers, voyagers, pioneers) => {
    const currentDateTime = new Date().toISOString().replace(/:/g, "-").split(".")[0];

  try {
    await setDoc(doc(db, "FileData", currentDateTime), {
      Explorers: explorers,
      Discoverers: discoverers,
      Voyagers: voyagers,
      Pioneers: pioneers,
    });
    console.log("Data uploaded to Firestore successfully!");
  } catch (error) {
    console.error("Error uploading data to Firestore: ", error);
  }
};
