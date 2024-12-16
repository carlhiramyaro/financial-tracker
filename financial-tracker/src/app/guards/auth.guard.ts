import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable(subscriber => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          subscriber.next(true);
        } else {
          this.router.navigate(['/sign-in']);
          subscriber.next(false);
        }
        subscriber.complete();
      });
    });
  }
} 