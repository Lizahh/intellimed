import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  rememberMe: boolean = false;
  
  // Login animation states
  formActive: boolean = false;
  loginSuccess: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if already logged in
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.navigateToDashboard();
      }
    });
    
    // Animation timing
    setTimeout(() => {
      this.formActive = true;
    }, 300);
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  login(): void {
    this.errorMessage = '';
    
    // Basic validation
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }
    
    this.isLoading = true;
    
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        if (user) {
          this.loginSuccess = true;
          setTimeout(() => {
            this.navigateToDashboard();
          }, 1000); // Wait for animation to finish
        } else {
          this.errorMessage = 'Invalid username or password.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred during login. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  private navigateToDashboard(): void {
    this.router.navigate(['/']);
  }
}