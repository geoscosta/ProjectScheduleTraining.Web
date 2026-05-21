import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../core/services/student/student.service';
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { FinancialService } from '../../../core/services/financial/financial.service';
import { SchedulingService } from '../../../core/services/scheduling/scheduling.service';
import { Student, StudentStatus } from '../../../core/models/student.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { FinancialSummary } from '../../../core/models/financial.model';
import { SchedulingSummary } from '../../../core/models/scheduling.model';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss'
})
export class StudentDetailComponent implements OnInit {

  isLoading = true;
  student: Student | null = null;
  enrollment: Enrollment | null = null;
  financials: FinancialSummary[] = [];
  schedulings: SchedulingSummary[] = [];
  StudentStatus = StudentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private enrollmentService: EnrollmentService,
    private financialService: FinancialService,
    private schedulingService: SchedulingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudentData(id);
    }
  }

  /// Carrega todos os dados do aluno incluindo matrícula, financeiro e agendamentos.
  private loadStudentData(id: string): void {
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.student = student;
        this.isLoading = false;
        this.loadRelatedData(id);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Aluno não encontrado.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/students']);
      }
    });
  }

  /// Carrega os dados relacionados ao aluno em paralelo.
  private loadRelatedData(id: string): void {
    this.enrollmentService.getByStudentId(id).subscribe({
      next: (enrollment) => this.enrollment = enrollment,
      error: () => this.enrollment = null
    });

    this.financialService.getByStudentId(id).subscribe({
      next: (financials) => this.financials = financials,
      error: () => this.financials = []
    });

    this.schedulingService.getByStudentId(id).subscribe({
      next: (schedulings) => this.schedulings = schedulings,
      error: () => this.schedulings = []
    });
  }

  /// Retorna o label do status do aluno.
  getStatusLabel(status: StudentStatus): string {
    const labels: Record<StudentStatus, string> = {
      [StudentStatus.Active]: 'Ativo',
      [StudentStatus.Inactive]: 'Inativo',
      [StudentStatus.Blocked]: 'Bloqueado'
    };
    return labels[status];
  }

  /// Retorna a classe CSS do badge de status.
  getStatusClass(status: StudentStatus): string {
    const classes: Record<StudentStatus, string> = {
      [StudentStatus.Active]: 'bg-green-100 text-green-700',
      [StudentStatus.Inactive]: 'bg-gray-100 text-gray-700',
      [StudentStatus.Blocked]: 'bg-red-100 text-red-700'
    };
    return classes[status];
  }

  /// Navega para a edição do aluno.
  onEdit(): void {
    this.router.navigate(['/students', this.student?.id, 'edit']);
  }

  /// Volta para a listagem de alunos.
  onBack(): void {
    this.router.navigate(['/students']);
  }
}
