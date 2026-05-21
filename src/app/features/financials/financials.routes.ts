import { Routes } from '@angular/router';

export const financialsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./financial-list/financial-list.component').then(m => m.FinancialListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./financial-form/financial-form.component').then(m => m.FinancialFormComponent)
  }
];
