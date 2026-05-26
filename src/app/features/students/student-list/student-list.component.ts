import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { StudentService } from '../../../core/services/student/student.service';
import { StudentSummary, StudentStatus } from '../../../core/models/student.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StudentFilterComponent, StudentFilter } from '../student-filter/student-filter.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    StudentFilterComponent,
    BadgeComponent,
    AppButtonComponent,
    PaginatorComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit {

  displayedColumns = ['name', 'email', 'phone', 'status', 'actions'];
  students: StudentSummary[] = [];
  filteredStudents: StudentSummary[] = [];
  pagedStudents: StudentSummary[] = [];
  isLoading = true;
  StudentStatus = StudentStatus;

  page = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private studentService: StudentService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /// Carrega a lista de alunos do sistema.
  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = students;
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Erro ao carregar alunos.');
      }
    });
  }

  /// Aplica o filtro recebido do StudentFilterComponent.
  onFilterApplied(filter: StudentFilter): void {
    this.filteredStudents = this.students.filter(student => {
      if (filter.name && !student.name.toLowerCase()
        .includes(filter.name.toLowerCase())) return false;
      if (filter.email && !student.email.toLowerCase()
        .includes(filter.email.toLowerCase())) return false;
      if (filter.status !== null && student.status !== filter.status) return false;
      return true;
    });
    this.page = 1;
    this.updatePagination();
  }

  /// Limpa os filtros e restaura a lista completa.
  onFilterCleared(): void {
    this.filteredStudents = this.students;
    this.page = 1;
    this.updatePagination();
  }

  /// Atualiza os dados de paginação.
  private updatePagination(): void {
    this.totalElements = this.filteredStudents.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    this.pagedStudents = this.filteredStudents.slice(start, start + this.pageSize);
  }

  /// Navega para a página selecionada.
  onPageChanged(page: number): void {
    this.page = page;
    this.updatePagination();
  }

  /// Bloqueia um aluno com confirmação prévia.
  onBlock(id: string, name: string): void {
    this.notification.confirm({
      title: 'Bloquear Aluno',
      message: `Tem certeza que deseja bloquear "${name}"? O aluno não poderá realizar novos agendamentos.`,
      confirmLabel: 'Bloquear',
      cancelLabel: 'Cancelar',
      type: 'warning'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.studentService.block(id).subscribe({
        next: () => {
          this.notification.success('Aluno bloqueado com sucesso.');
          this.loadStudents();
        },
        error: (err) => {
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao bloquear aluno.'
          );
        }
      });
    });
  }

  /// Desbloqueia um aluno com confirmação prévia.
  onUnblock(id: string, name: string): void {
    this.notification.confirm({
      title: 'Desbloquear Aluno',
      message: `Deseja desbloquear "${name}"?`,
      confirmLabel: 'Desbloquear',
      cancelLabel: 'Cancelar',
      type: 'info'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.studentService.unblock(id).subscribe({
        next: () => {
          this.notification.success('Aluno desbloqueado com sucesso.');
          this.loadStudents();
        },
        error: (err) => {
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao desbloquear aluno.'
          );
        }
      });
    });
  }

  /// Inativa um aluno com confirmação prévia.
  onDeactivate(id: string, name: string): void {
    this.notification.confirm({
      title: 'Inativar Aluno',
      message: `Tem certeza que deseja inativar "${name}"? Esta ação não pode ser desfeita facilmente.`,
      confirmLabel: 'Inativar',
      cancelLabel: 'Cancelar',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.studentService.deactivate(id).subscribe({
        next: () => {
          this.notification.success('Aluno inativado com sucesso.');
          this.loadStudents();
        },
        error: (err) => {
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao inativar aluno.'
          );
        }
      });
    });
  }

  /// Retorna o tipo do badge baseado no status do aluno.
  getStatusBadgeType(status: StudentStatus): BadgeType {
    const types: Record<StudentStatus, BadgeType> = {
      [StudentStatus.Active]: 'success',
      [StudentStatus.Inactive]: 'neutral',
      [StudentStatus.Blocked]: 'danger'
    };
    return types[status];
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
}
