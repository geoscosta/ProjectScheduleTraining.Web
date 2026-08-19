import { Routes } from '@angular/router';

export const studentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./student-list/student-list.component').then(
        (m) => m.StudentListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./student-form/student-form.component').then(
        (m) => m.StudentFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./student-detail/student-detail.component').then(
        (m) => m.StudentDetailComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./student-form/student-form.component').then(
        (m) => m.StudentFormComponent,
      ),
  },
  {
    path: ':id/parq',
    loadComponent: () =>
      import('./student-parq/student-parq.component').then(
        (m) => m.StudentParqComponent,
      ),
  },
  {
    path: ':id/vacations',
    loadComponent: () =>
      import('./student-vacations/student-vacations.component').then(
        (m) => m.StudentVacationsComponent,
      ),
  },
  {
    path: ':id/workout',
    loadComponent: () =>
      import('./student-workout/student-workout.component').then(
        (m) => m.StudentWorkoutComponent,
      ),
  },
  {
    path: ':id/workout/form',
    loadComponent: () =>
      import('./student-workout-form/student-workout-form.component').then(
        (m) => m.StudentWorkoutFormComponent,
      ),
  },
];
