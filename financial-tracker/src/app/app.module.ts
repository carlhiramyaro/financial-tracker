import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { SignInComponent } from '././components/sign-in/sign-in.component';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const app = initializeApp(environment.firebase);
const storage = getStorage(app);

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule
    ),
    provideRouter(routes),
  ],
});
