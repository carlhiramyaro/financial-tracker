import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface Expense {
  amount: number;
  category: string;
  date: string;
  details: string;
  userId: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async addExpense(expense: Omit<Expense, 'userId' | 'timestamp'>) {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      const expenseWithMetadata = {
        ...expense,
        userId,
        timestamp: new Date(),
      };

      const expensesRef = collection(this.firestore, 'expenses');
      const docRef = await addDoc(expensesRef, expenseWithMetadata);
      console.log('Expense added successfully with ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      const userId = this.auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      const expensesRef = collection(this.firestore, 'expenses');
      const q = query(expensesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data() as Expense;
        return data;
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  }
}
