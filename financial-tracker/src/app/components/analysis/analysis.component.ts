import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpenseService, Expense } from '../../services/expense.service';
import { UserService } from '../../services/user.service';
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
  private barChart: Chart | undefined;
  private pieChart: Chart | undefined;

  constructor(
    private expenseService: ExpenseService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.createMonthlyExpensesChart();
    this.createMonthlyBreakdownChart();
  }

  async createMonthlyExpensesChart() {
    const expenses = await this.expenseService.getExpenses();
    const monthlyTotals = this.calculateMonthlyTotals(expenses);

    const ctx = document.getElementById(
      'monthlyExpensesChart'
    ) as HTMLCanvasElement;
    this.barChart = new Chart(ctx, {
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

  async createMonthlyBreakdownChart() {
    const expenses = await this.expenseService.getExpenses();
    const monthlyIncome = (await this.userService.getUserIncome()) || 0;
    const currentMonth = new Date().getMonth();

    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter(
      (expense) => new Date(expense.date).getMonth() === currentMonth
    );

    // Calculate totals by category
    const categoryTotals = new Map<string, number>();
    let totalSpent = 0;

    currentMonthExpenses.forEach((expense) => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
      totalSpent += expense.amount;
    });

    // Calculate savings
    const savings = monthlyIncome - totalSpent;
    if (savings > 0) {
      categoryTotals.set('Savings', savings);
    }

    // Prepare data for chart
    const labels = Array.from(categoryTotals.keys());
    const data = Array.from(categoryTotals.values());
    const backgroundColors = this.generateColors(labels.length);

    const ctx = document.getElementById(
      'monthlyBreakdownChart'
    ) as HTMLCanvasElement;
    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: $${value.toFixed(
                  2
                )} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  private generateColors(count: number): string[] {
    const colors = [
      'rgba(255, 99, 132, 0.8)', // red
      'rgba(54, 162, 235, 0.8)', // blue
      'rgba(255, 206, 86, 0.8)', // yellow
      'rgba(75, 192, 192, 0.8)', // green
      'rgba(153, 102, 255, 0.8)', // purple
      'rgba(255, 159, 64, 0.8)', // orange
      'rgba(199, 199, 199, 0.8)', // gray
    ];

    // If we need more colors than we have, repeat the array
    while (colors.length < count) {
      colors.push(...colors);
    }

    return colors.slice(0, count);
  }
}
