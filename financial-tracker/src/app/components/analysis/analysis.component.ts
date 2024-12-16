import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpenseService, Expense } from '../../services/expense.service';
import { UserService } from '../../services/user.service';
import { Chart, registerables, ChartEvent } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css'],
})
export class AnalysisComponent implements OnInit, OnDestroy {
  public barChart: Chart | undefined;
  public pieChart: Chart | undefined;
  selectedCategory: string | null = null;
  filteredExpenses: Expense[] = [];
  currentMonthExpenses: Expense[] = [];
  private expenseSubscription: any;

  constructor(
    private expenseService: ExpenseService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createMonthlyExpensesChart();
    this.createMonthlyBreakdownChart();

    this.expenseSubscription = this.expenseService.getExpensesObservable().subscribe(expenses => {
      if (this.barChart) {
        this.updateBarChart(expenses);
      }
      if (this.pieChart) {
        this.updatePieChart(expenses);
      }
    });
  }

  ngOnDestroy() {
    if (this.expenseSubscription) {
      this.expenseSubscription.unsubscribe();
    }
  }

  private async updateBarChart(expenses: Expense[]) {
    const monthlyIncome = await this.userService.getUserIncome() || 0;
    const monthlyTotals = this.calculateMonthlyTotals(expenses);
    
    if (this.barChart) {
      this.barChart.data.datasets[0].data = monthlyTotals;
      this.barChart.data.datasets[0].backgroundColor = monthlyTotals.map(total => 
        total > monthlyIncome 
          ? 'rgba(239, 68, 68, 0.5)' 
          : 'rgba(147, 51, 234, 0.5)'
      );
      this.barChart.data.datasets[0].borderColor = monthlyTotals.map(total => 
        total > monthlyIncome 
          ? 'rgba(239, 68, 68, 1)' 
          : 'rgba(147, 51, 234, 1)'
      );
      this.barChart.data.datasets[1].data = Array(12).fill(monthlyIncome);
      if (this.barChart.options.scales) {
        this.barChart.options.scales['y'] = {
          ...this.barChart.options.scales['y'],
          suggestedMax: monthlyIncome * 1.2
        };
      }
      this.barChart.update();
    }
  }

  private async updatePieChart(expenses: Expense[]) {
    try {
      const monthlyIncome = (await this.userService.getUserIncome()) || 0;
      const currentMonth = new Date().getMonth();

      if (this.pieChart) {
        this.pieChart.destroy();
      }

      this.currentMonthExpenses = expenses.filter(
        (expense) => new Date(expense.date).getMonth() === currentMonth
      );

      const categoryTotals = new Map<string, number>();
      let totalSpent = 0;

      console.log('Current month expenses:', this.currentMonthExpenses);

      this.currentMonthExpenses.forEach((expense) => {
        const normalizedCategory = expense.category.trim();
        console.log('Processing category:', normalizedCategory);
        
        const current = categoryTotals.get(normalizedCategory) || 0;
        categoryTotals.set(normalizedCategory, current + expense.amount);
        totalSpent += expense.amount;
      });

      console.log('Category totals:', Array.from(categoryTotals.entries()));

      const savings = monthlyIncome - totalSpent;
      if (savings > 0) {
        categoryTotals.set('Savings', savings);
      }

      const labels = Array.from(categoryTotals.keys());
      const data = Array.from(categoryTotals.values());

      console.log('Chart labels:', labels);
      console.log('Chart data:', data);

      const ctx = document.getElementById('monthlyBreakdownChart') as HTMLCanvasElement;
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: this.generateColors(labels.length),
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  return `${context.label}: $${value.toFixed(2)}`;
                }
              }
            }
          },
          onClick: (event: ChartEvent, elements: any[]) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const category = labels[index];
              this.showCategoryDetails(category);
            }
          },
        }
      });
    } catch (error) {
      console.error('Error updating pie chart:', error);
    }
  }

  async createMonthlyExpensesChart() {
    const expenses = await this.expenseService.getExpenses();
    const monthlyIncome = await this.userService.getUserIncome() || 0;
    const monthlyTotals = this.calculateMonthlyTotals(expenses);
    const isDarkMode = document.body.classList.contains('dark-mode');

    const ctx = document.getElementById('monthlyExpensesChart') as HTMLCanvasElement;
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        datasets: [
          {
            label: 'Monthly Expenses',
            data: monthlyTotals,
            backgroundColor: monthlyTotals.map(total => 
              total > monthlyIncome 
                ? 'rgba(239, 68, 68, 0.5)'  // Red for exceeding income
                : 'rgba(147, 51, 234, 0.5)' // Purple for normal
            ),
            borderColor: monthlyTotals.map(total => 
              total > monthlyIncome 
                ? 'rgba(239, 68, 68, 1)' 
                : 'rgba(147, 51, 234, 1)'
            ),
            borderWidth: 1,
          },
          {
            label: 'Monthly Income',
            data: Array(12).fill(monthlyIncome),
            type: 'line',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointStyle: false
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          ['y']: {
            beginAtZero: true,
            suggestedMax: monthlyIncome * 1.2,
            title: {
              display: true,
              text: 'Amount ($)',
              color: isDarkMode ? '#f7fafc' : '#2d3748',
            },
            ticks: {
              color: isDarkMode ? '#f7fafc' : '#4a5568',
              font: {
                weight: 500
              }
            },
            grid: {
              color: isDarkMode ? 'rgba(247, 250, 252, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          },
          ['x']: {
            ticks: {
              color: isDarkMode ? '#f7fafc' : '#4a5568',
              font: {
                weight: 500
              }
            },
            grid: {
              color: isDarkMode ? 'rgba(247, 250, 252, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: isDarkMode ? '#f7fafc' : '#2d3748',
              font: {
                weight: 500
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                if (context.dataset.label === 'Monthly Expenses' && value > monthlyIncome) {
                  return `${context.dataset.label}: $${value} (Exceeds Income)`;
                }
                return `${context.dataset.label}: $${value}`;
              }
            }
          }
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
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Store current month expenses for later use
    this.currentMonthExpenses = expenses.filter(
      (expense) => new Date(expense.date).getMonth() === currentMonth
    );

    // Calculate totals by category
    const categoryTotals = new Map<string, number>();
    let totalSpent = 0;

    this.currentMonthExpenses.forEach((expense) => {
      // Normalize category name (capitalize first letter, lowercase rest)
      const normalizedCategory = expense.category.charAt(0).toUpperCase() + 
                               expense.category.slice(1).toLowerCase();
      
      const current = categoryTotals.get(normalizedCategory) || 0;
      categoryTotals.set(normalizedCategory, current + expense.amount);
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

    const ctx = document.getElementById('monthlyBreakdownChart') as HTMLCanvasElement;
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
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              color: isDarkMode ? '#f7fafc' : '#2d3748',
              font: {
                size: 14,
                weight: 500
              },
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                return `${context.label}: $${value.toFixed(2)}`;
              }
            },
            backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
            titleColor: isDarkMode ? '#f7fafc' : '#2d3748',
            bodyColor: isDarkMode ? '#f7fafc' : '#4a5568',
            padding: 12,
            bodyFont: {
              size: 14
            }
          }
        },
        onClick: (event: ChartEvent, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const category = labels[index];
            this.showCategoryDetails(category);
          }
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

  showCategoryDetails(category: string) {
    this.selectedCategory = category;
    this.filteredExpenses = this.currentMonthExpenses.filter(
      (expense) => expense.category === category
    );
    this.filteredExpenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async backToPieChart() {
    this.selectedCategory = null;
    // Get latest expenses and redraw the pie chart
    const expenses = await this.expenseService.getExpenses();
    this.updatePieChart(expenses);
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
