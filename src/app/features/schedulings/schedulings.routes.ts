import { Routes } from '@angular/router';

export const schedulingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./scheduling-list/scheduling-list.component').then(m => m.SchedulingListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./scheduling-form/scheduling-form.component').then(m => m.SchedulingFormComponent)
  }
];
