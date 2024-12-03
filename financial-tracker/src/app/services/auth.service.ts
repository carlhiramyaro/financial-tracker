import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  async signIn(email: string, password: string) {
    try {
      console.log('AuthService: Attempting sign in...'); // Debug log
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('AuthService: Sign in successful', result); // Debug log
      return result;
    } catch (error) {
      console.error('AuthService: Sign in error', error); // Debug log
      throw error;
    }
  }

  async signUp(email: string, password: string) {
    try {
      console.log('AuthService: Attempting sign up...'); // Debug log
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('AuthService: Sign up successful', result); // Debug log
      return result;
    } catch (error) {
      console.error('AuthService: Sign up error', error); // Debug log
      throw error;
    }
  }

  async signOut() {
    return await signOut(this.auth);
  }
}
