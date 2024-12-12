import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  amount: number = 0;
  description: string = '';
  date: string = '';

  constructor(private router: Router) {}

  navigateTo(route: string) {
    // This will be implemented when you add these routes
    this.router.navigate([`/${route}`]);
  }

  proceedToCategory() {
    // Implementation will go here
    console.log('Proceeding with:', {
      amount: this.amount,
      description: this.description,
      date: this.date,
    });
  }
}
