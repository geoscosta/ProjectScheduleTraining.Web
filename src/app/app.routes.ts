import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'students',
        loadChildren: () =>
          import('./features/students/students.routes').then(m => m.studentsRoutes)
      },
      {
        path: 'plans',
        loadChildren: () =>
          import('./features/plans/plans.routes').then(m => m.plansRoutes)
      },
      {
        path: 'enrollments',
        loadChildren: () =>
          import('./features/enrollments/enrollments.routes').then(m => m.enrollmentsRoutes)
      },
      {
        path: 'schedules',
        loadChildren: () =>
          import('./features/schedules/schedules.routes').then(m => m.schedulesRoutes)
      },
      {
        path: 'schedulings',
        loadChildren: () =>
          import('./features/schedulings/schedulings.routes').then(m => m.schedulingsRoutes)
      },
      {
        path: 'financials',
        loadChildren: () =>
          import('./features/financials/financials.routes').then(m => m.financialsRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
