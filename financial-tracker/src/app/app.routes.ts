import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { SettingsComponent } from './components/settings/settings.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'analysis', component: AnalysisComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [AuthGuard] },
];
