import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  amount: number = 0;
  category: string = '';
  description: string = '';
  details: string = '';
  date: string = '';
  isSubmitting: boolean = false;
  currentDate: string;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(
    private router: Router,
    private expenseService: ExpenseService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
  }

  validateAmount(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value && parseFloat(input.value) < 0) {
      input.value = '0';
      this.amount = 0;
    }
  }

  async submitExpense() {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;

      if (!this.amount || this.amount <= 0 || !this.category || !this.date || !this.details) {
        alert('Please fill in all fields with valid values');
        this.isSubmitting = false;
        return;
      }

      await this.expenseService.addExpense({
        amount: this.amount,
        category: this.category,
        details: this.details,
        date: this.date,
      });

      // Clear the form
      this.amount = 0;
      this.category = '';
      this.details = '';
      this.date = '';

      // Show success toast
      this.toastMessage = 'Expense submitted successfully!';
      this.showToast = true;
      
      // Reset loading state before starting the toast timer
      this.isSubmitting = false;
      
      setTimeout(() => {
        this.showToast = false;
      }, 3000);

    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Error submitting expense. Please try again.');
      this.isSubmitting = false;
    }
  }

  closeToast() {
    this.showToast = false;
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/sign-in']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
