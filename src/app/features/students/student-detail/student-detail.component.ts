import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../core/services/student/student.service';
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { FinancialService } from '../../../core/services/financial/financial.service';
import { SchedulingService } from '../../../core/services/scheduling/scheduling.service';
import { Student, StudentStatus } from '../../../core/models/student.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { FinancialSummary, FinancialStatus } from '../../../core/models/financial.model';
import { SchedulingSummary, SchedulingStatus } from '../../../core/models/scheduling.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BadgeComponent,
    AppButtonComponent
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
  FinancialStatus = FinancialStatus;
  SchedulingStatus = SchedulingStatus;

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
    if (id) this.loadStudentData(id);
  }

  /// Carrega os dados completos do aluno pelo ID.
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

  /// Carrega matrícula, financeiro e agendamentos do aluno em paralelo.
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

  /// Retorna o tipo do badge baseado no status do aluno.
  getStudentBadgeType(status: StudentStatus): BadgeType {
    const types: Record<StudentStatus, BadgeType> = {
      [StudentStatus.Active]: 'success',
      [StudentStatus.Inactive]: 'neutral',
      [StudentStatus.Blocked]: 'danger'
    };
    return types[status];
  }

  /// Retorna o label do status do aluno.
  getStudentStatusLabel(status: StudentStatus): string {
    const labels: Record<StudentStatus, string> = {
      [StudentStatus.Active]: 'Ativo',
      [StudentStatus.Inactive]: 'Inativo',
      [StudentStatus.Blocked]: 'Bloqueado'
    };
    return labels[status];
  }

  /// Retorna o tipo do badge baseado no status financeiro.
  getFinancialBadgeType(status: FinancialStatus): BadgeType {
    const types: Record<FinancialStatus, BadgeType> = {
      [FinancialStatus.Pending]: 'warning',
      [FinancialStatus.Paid]: 'success',
      [FinancialStatus.Overdue]: 'danger',
      [FinancialStatus.Cancelled]: 'neutral',
      [FinancialStatus.Exempt]: 'info'
    };
    return types[status];
  }

  /// Retorna o label do status financeiro.
  getFinancialStatusLabel(status: FinancialStatus): string {
    const labels: Record<FinancialStatus, string> = {
      [FinancialStatus.Pending]: 'Pendente',
      [FinancialStatus.Paid]: 'Pago',
      [FinancialStatus.Overdue]: 'Vencido',
      [FinancialStatus.Cancelled]: 'Cancelado',
      [FinancialStatus.Exempt]: 'Isento'
    };
    return labels[status];
  }

  /// Retorna o tipo do badge baseado no status do agendamento.
  getSchedulingBadgeType(status: SchedulingStatus): BadgeType {
    const types: Record<SchedulingStatus, BadgeType> = {
      [SchedulingStatus.Scheduled]: 'info',
      [SchedulingStatus.Present]: 'success',
      [SchedulingStatus.JustifiedAbsence]: 'warning',
      [SchedulingStatus.UnjustifiedAbsence]: 'warning',
      [SchedulingStatus.Cancelled]: 'danger',
      [SchedulingStatus.Makeup]: 'primary'
    };
    return types[status];
  }

  /// Retorna o label do status do agendamento.
  getSchedulingStatusLabel(status: SchedulingStatus): string {
    const labels: Record<SchedulingStatus, string> = {
      [SchedulingStatus.Scheduled]: 'Agendado',
      [SchedulingStatus.Present]: 'Presente',
      [SchedulingStatus.JustifiedAbsence]: 'Falta Justificada',
      [SchedulingStatus.UnjustifiedAbsence]: 'Falta Injustificada',
      [SchedulingStatus.Cancelled]: 'Cancelado',
      [SchedulingStatus.Makeup]: 'Reposição'
    };
    return labels[status];
  }

  /// Navega para a edição do aluno.
  onEdit(): void {
    this.router.navigate(['/students', this.student?.id, 'edit']);
  }
}
