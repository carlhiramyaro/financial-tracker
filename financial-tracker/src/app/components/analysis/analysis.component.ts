import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpenseService, Expense } from '../../services/expense.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css'],
})
export class AnalysisComponent implements OnInit {
  private chart: Chart | undefined;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.createMonthlyExpensesChart();
  }

  async createMonthlyExpensesChart() {
    const expenses = await this.expenseService.getExpenses();
    const monthlyTotals = this.calculateMonthlyTotals(expenses);

    const ctx = document.getElementById(
      'monthlyExpensesChart'
    ) as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Monthly Expenses',
            data: monthlyTotals,
            backgroundColor: 'rgba(147, 51, 234, 0.5)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)',
            },
          },
        },
      },
    });
  }

  private calculateMonthlyTotals(expenses: Expense[]): number[] {
    const monthlyTotals = new Array(12).fill(0);

    expenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] += expense.amount;
    });

    return monthlyTotals;
  }
}
