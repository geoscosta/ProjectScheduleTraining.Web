import { Routes } from '@angular/router';

export const schedulesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./schedule-list/schedule-list.component').then(m => m.ScheduleListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./schedule-form/schedule-form.component').then(m => m.ScheduleFormComponent)
  }
];
