import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    console.log('SignUpComponent: Form submitted'); // Debug log

    try {
      const result = await this.authService.signUp(this.email, this.password);
      console.log('SignUpComponent: Sign up successful', result); // Debug log
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('SignUpComponent: Sign up error', error); // Debug log
      this.error = error.message;
    }
  }
}
