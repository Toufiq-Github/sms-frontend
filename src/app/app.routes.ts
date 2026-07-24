import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component')
        .then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'files',
    loadComponent: () =>
      import('./pages/files/files.component')
        .then(m => m.FilesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports.component')
        .then(m => m.ReportsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component')
        .then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'data-upload',
    loadComponent: () =>
      import('./pages/data-upload/data-upload.component')
        .then(m => m.DataUploadComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'data-view',
    loadComponent: () =>
      import('./pages/data-view/data-view.component')
        .then(m => m.DataViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];