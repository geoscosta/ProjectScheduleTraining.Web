import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./plan-list/plan-list.component').then(m => m.PlanListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./plan-form/plan-form.component').then(m => m.PlanFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./plan-form/plan-form.component').then(m => m.PlanFormComponent)
  }
];
