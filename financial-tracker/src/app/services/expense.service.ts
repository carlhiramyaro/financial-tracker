import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Query,
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
export class ExpenseService implements OnDestroy {
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private unsubscribe?: () => void;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.setupExpensesListener();
  }

  private setupExpensesListener() {
    // Clear any existing listener
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Add auth state listener
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        const expensesRef = collection(this.firestore, 'expenses');
        const q = query(expensesRef, where('userId', '==', user.uid));

        this.unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const expenses = querySnapshot.docs.map((doc) => {
              return { ...(doc.data() as Expense) };
            });
            this.expensesSubject.next(expenses);
          },
          (error) => {
            console.error('Error listening to expenses:', error);
            // Handle the error gracefully
            this.expensesSubject.next([]);
          }
        );
      } else {
        // No user is signed in, clear the expenses
        this.expensesSubject.next([]);
        if (this.unsubscribe) {
          this.unsubscribe();
        }
      }
    });
  }

  ngOnDestroy() {
    // Clean up listener when service is destroyed
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  getExpensesObservable(): Observable<Expense[]> {
    return this.expensesSubject.asObservable();
  }

  async addExpense(expense: Omit<Expense, 'userId' | 'timestamp'>) {
    try {
      const result = await this.addExpenseToFirestore(expense);
      // The expenses will automatically refresh via the onSnapshot listener
      return result;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  private async addExpenseToFirestore(
    expense: Omit<Expense, 'userId' | 'timestamp'>
  ) {
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
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
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
