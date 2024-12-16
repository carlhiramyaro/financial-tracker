import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentIncome: number = 0;
  isDarkMode: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      this.currentIncome = await this.userService.getUserIncome() || 0;
      this.isDarkMode = localStorage.getItem('theme') === 'dark';
      this.applyTheme();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  updateIncome() {
    this.router.navigate(['/onboarding']);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
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