import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { StudentService } from '../../../core/services/student/student.service';
import { Enrollment } from '../../../core/models/enrollment.model';
import { StudentSummary } from '../../../core/models/student.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { EnrollmentFilterComponent, EnrollmentFilter } from '../enrollment-filter/enrollment-filter.component';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    BadgeComponent,
    AppButtonComponent,
    EnrollmentFilterComponent
  ],
  templateUrl: './enrollment-list.component.html',
  styleUrl: './enrollment-list.component.scss'
})
export class EnrollmentListComponent implements OnInit {

  enrollments: Enrollment[] = [];
  students: StudentSummary[] = [];
  isLoading = false;
  isLoadingStudents = true;

  constructor(
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /// Exibe mensagem de sucesso via snackbar.
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-success' });
  }

  /// Exibe mensagem de erro via snackbar.
  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-error' });
  }

  /// Carrega a lista de alunos para o filtro.
  private loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.isLoadingStudents = false;
      }
    });
  }

  /// Aplica o filtro e busca a matrícula do aluno selecionado.
  onFilterApplied(filter: EnrollmentFilter): void {
    if (!filter.studentId) return;

    this.isLoading = true;
    this.enrollmentService.getByStudentId(filter.studentId).subscribe({
      next: (enrollment) => {
        this.enrollments = [enrollment];
        this.isLoading = false;
      },
      error: () => {
        this.enrollments = [];
        this.isLoading = false;
        this.showError('Nenhuma matrícula encontrada para este aluno.');
      }
    });
  }

  /// Limpa os filtros e a lista de matrículas.
  onFilterCleared(): void {
    this.enrollments = [];
  }

  /// Cancela uma matrícula no sistema.
  onCancel(id: string): void {
    this.enrollmentService.cancel(id).subscribe({
      next: () => {
        this.showSuccess('Matrícula cancelada com sucesso.');
        this.enrollments = [];
      },
      error: () => this.showError('Erro ao cancelar matrícula.')
    });
  }
}
