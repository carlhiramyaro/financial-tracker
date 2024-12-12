import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { HistoryComponent } from './components/history/history.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';

export const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'home', component: HomeComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'onboarding', component: OnboardingComponent },
];
