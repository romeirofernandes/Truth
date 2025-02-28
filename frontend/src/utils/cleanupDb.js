import { db } from '../components/firebase';
import { collection, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';

export const cleanupDatabase = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const opinionsRef = collection(db, 'opinions');
    const q = query(
      opinionsRef,
      where('createdAt', '<=', Timestamp.fromDate(twoDaysAgo))
    );

    const snapshot = await getDocs(q);
    const deletePromises = [];

    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`Cleaned up ${deletePromises.length} old opinions`);
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
};
