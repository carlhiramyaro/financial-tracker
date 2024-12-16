import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private expensesSubject = new BehaviorSubject<Expense[]>([]);

  constructor(private firestore: Firestore, private auth: Auth) {
    // Initialize expenses
    this.refreshExpenses();
  }

  private async refreshExpenses() {
    try {
      const expenses = await this.getExpenses();
      this.expensesSubject.next(expenses);
    } catch (error) {
      console.error('Error refreshing expenses:', error);
    }
  }

  getExpensesObservable(): Observable<Expense[]> {
    return this.expensesSubject.asObservable();
  }

  async addExpense(expense: Omit<Expense, 'userId' | 'timestamp'>) {
    try {
      const result = await this.addExpenseToFirestore(expense);
      // Refresh expenses after adding new one
      await this.refreshExpenses();
      return result;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  private async addExpenseToFirestore(expense: Omit<Expense, 'userId' | 'timestamp'>) {
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
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      // Wait for auth state to be ready
      const user = await new Promise<any>((resolve) => {
        const unsubscribe = this.auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      if (!user) {
        throw new Error('No user logged in');
      }

      const expensesRef = collection(this.firestore, 'expenses');
      const q = query(expensesRef, where('userId', '==', user.uid));
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
