import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface Expense {
  amount: number;
  category: string;
  date: string;
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
}
