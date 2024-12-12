import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  amount: number = 0;
  description: string = '';
  date: string = '';

  constructor(private router: Router, private expenseService: ExpenseService) {}

  async submitExpense() {
    try {
      if (!this.amount || !this.description || !this.date) {
        alert('Please fill in all fields');
        return;
      }

      await this.expenseService.addExpense({
        amount: this.amount,
        category: this.description,
        date: this.date,
      });

      // Clear the form
      this.amount = 0;
      this.description = '';
      this.date = '';

      alert('Expense submitted successfully!');
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Error submitting expense. Please try again.');
    }
  }
}
