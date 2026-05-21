import { Routes } from '@angular/router';

export const enrollmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./enrollment-list/enrollment-list.component').then(m => m.EnrollmentListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./enrollment-form/enrollment-form.component').then(m => m.EnrollmentFormComponent)
  }
];
