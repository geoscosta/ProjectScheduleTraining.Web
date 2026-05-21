import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { StudentService } from '../../../core/services/student/student.service';
import { Enrollment } from '../../../core/models/enrollment.model';
import { StudentSummary } from '../../../core/models/student.model';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './enrollment-list.component.html',
  styleUrl: './enrollment-list.component.scss'
})
export class EnrollmentListComponent implements OnInit {

  displayedColumns = ['student', 'startDate', 'expirationDate', 'paymentDueDay', 'status', 'actions'];
  enrollments: Enrollment[] = [];
  students: StudentSummary[] = [];
  isLoading = true;
  searchStudentId = '';

  constructor(
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /// Carrega a lista de alunos para busca de matrículas.
  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar alunos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Busca a matrícula ativa do aluno selecionado.
  onSearchEnrollment(studentId: string): void {
    if (!studentId) return;

    this.isLoading = true;
    this.enrollmentService.getByStudentId(studentId).subscribe({
      next: (enrollment) => {
        this.enrollments = [enrollment];
        this.isLoading = false;
      },
      error: () => {
        this.enrollments = [];
        this.isLoading = false;
        this.snackBar.open('Nenhuma matrícula ativa encontrada.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Cancela uma matrícula no sistema.
  onCancel(id: string): void {
    this.enrollmentService.cancel(id).subscribe({
      next: () => {
        this.snackBar.open('Matrícula cancelada com sucesso.', 'Fechar', { duration: 3000 });
        this.enrollments = [];
        this.searchStudentId = '';
      },
      error: () => this.snackBar.open('Erro ao cancelar matrícula.', 'Fechar', { duration: 3000 })
    });
  }
}
