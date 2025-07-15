import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from './firebase';

/**
 * Updates waitlist status to 'joined' when a user creates an account
 * @param email - The email address of the user who just created an account
 */
export const updateWaitlistStatus = async (email: string): Promise<void> => {
  try {
    // Query the waitlist collection for entries with matching email
    const waitlistQuery = query(
      collection(firestore, 'waitlist'),
      where('email', '==', email.toLowerCase())
    );
    
    const querySnapshot = await getDocs(waitlistQuery);
    
    // Update all matching entries to 'joined' status
    const updatePromises = querySnapshot.docs.map(async (document) => {
      const docRef = doc(firestore, 'waitlist', document.id);
      await updateDoc(docRef, {
        status: 'joined',
        joinedAt: new Date(),
        joinedMethod: 'account_creation'
      });
    });
    
    await Promise.all(updatePromises);
    
    if (querySnapshot.docs.length > 0) {
      console.log(`Updated ${querySnapshot.docs.length} waitlist entry(ies) to 'joined' status for email: ${email}`);
    }
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    // Don't throw the error to avoid breaking the authentication flow
  }
};

/**
 * Checks if an email exists in the waitlist
 * @param email - The email address to check
 * @returns Promise<boolean> - True if email exists in waitlist
 */
export const checkWaitlistEmail = async (email: string): Promise<boolean> => {
  try {
    const waitlistQuery = query(
      collection(firestore, 'waitlist'),
      where('email', '==', email.toLowerCase())
    );
    
    const querySnapshot = await getDocs(waitlistQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking waitlist email:', error);
    return false;
  }
}; 