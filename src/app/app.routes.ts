import { Routes } from '@angular/router';
import { PatientDetailsComponent } from './features/patient-details/patient-details.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: PatientDetailsComponent },
      { path: 'patients', component: PatientDetailsComponent },
      { path: 'patients/:id', component: PatientDetailsComponent }
    ]
  },
  { path: '**', redirectTo: '/login' } // Catch all route for 404
];
