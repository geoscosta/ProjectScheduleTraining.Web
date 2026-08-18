import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { StudentService } from '../../../core/services/student/student.service';
import { Enrollment } from '../../../core/models/enrollment.model';
import { StudentSummary } from '../../../core/models/student.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { EnrollmentFilterComponent, EnrollmentFilter } from '../enrollment-filter/enrollment-filter.component';
import { CancelEnrollmentDialogComponent } from '../cancel-enrollment-dialog/cancel-enrollment-dialog.component';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
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
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.isLoadingStudents = false;
      }
    });
  }

  onFilterApplied(filter: EnrollmentFilter): void {
    if (!filter.studentId) return;

    this.isLoading = true;
    this.enrollmentService.getByStudentId(filter.studentId).subscribe({
      next: (enrollment) => {
        this.enrollments = [enrollment];
        this.isLoading = false;
      },
      error: (err) => {
        this.enrollments = [];
        this.isLoading = false;
        this.notification.error(
          err.error?.errors?.[0] || 'Nenhuma matrícula encontrada para este aluno.'
        );
      }
    });
  }

  onFilterCleared(): void {
    this.enrollments = [];
  }

  /// Abre o dialog de cancelamento com opções conforme tipo do plano.
  onCancel(enrollment: Enrollment, studentName: string): void {
    const dialogRef = this.dialog.open(CancelEnrollmentDialogComponent, {
      data: { enrollment, studentName },
      width: '440px',
      disableClose: true,
      panelClass: 'confirm-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.enrollmentService.cancel(
        enrollment.id,
        result.cancellationOption,
        result.substituteStudentId
      ).subscribe({
        next: () => {
          this.notification.success('Matrícula cancelada com sucesso.');
          this.enrollments = [];
        },
        error: (err) => {
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao cancelar matrícula.'
          );
        }
      });
    });
  }
}
