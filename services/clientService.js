import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function addClient(clientData) {
  return await addDoc(collection(db, "clients"), clientData);
}

export async function getClients() {
  const snapshot = await getDocs(collection(db, "clients"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
