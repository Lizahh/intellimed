import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'admin' | 'nurse';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock user data for demo - in a real app, this would come from a backend
  private mockUsers = [
    {
      id: '1',
      username: 'sarah.chen',
      password: 'password123',
      email: 'sarah.chen@intellimed.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'doctor' as const
    },
    {
      id: '2',
      username: 'admin',
      password: 'admin123',
      email: 'admin@intellimed.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const
    }
  ];

  constructor() {
    // Check if user is already logged in from localStorage
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    const savedUser = localStorage.getItem('intellimed_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('intellimed_user');
      }
    }
  }

  login(username: string, password: string): Observable<User | null> {
    // In a real app, this would be an API call
    const user = this.mockUsers.find(u => 
      u.username === username && u.password === password
    );

    // Simulate network delay
    return of(user ? this.omitPassword(user) : null).pipe(
      delay(800), // Simulate network delay
      tap(user => {
        if (user) {
          // Store in session
          localStorage.setItem('intellimed_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('intellimed_user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // Helper method to remove the password before returning user data
  private omitPassword(user: any): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}