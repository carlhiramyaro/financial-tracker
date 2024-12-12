import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class OnboardingComponent {
  monthlyIncome: number = 0;
  error: string = '';

  constructor(private userService: UserService, private router: Router) {}

  async onSubmit() {
    try {
      if (!this.monthlyIncome || this.monthlyIncome <= 0) {
        this.error = 'Please enter a valid monthly income';
        return;
      }

      await this.userService.setUserIncome(this.monthlyIncome);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.error = error.message;
    }
  }
}
