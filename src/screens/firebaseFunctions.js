import { getFirestore, collection, getDocs, addDoc, doc,getDoc } from 'firebase/firestore';
import {app} from '../config'
// Initialize Firestore
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

export async function addPoints(event, teacher, date, house, place, customPoints) {
    if (customPoints) {
        try {
            // Create document with custom points
            await createDocument(house, {
                event: event,
                teacher: teacher,
                date: date.toISOString(), // Convert date to ISO string
                place: place,
                customPoints: parseInt(customPoints) // Convert custom points to integer
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
                    points: parseInt(points)
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
