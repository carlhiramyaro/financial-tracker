import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async setUserIncome(monthlyIncome: number) {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(
        userRef,
        {
          monthlyIncome,
          createdAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error setting user income:', error);
      throw error;
    }
  }

  async getUserIncome(): Promise<number | null> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      const userRef = doc(this.firestore, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data()['monthlyIncome'] || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user income:', error);
      throw error;
    }
  }
}
