import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { StudentService } from '../../../core/services/student/student.service';
import { StudentSummary, StudentStatus } from '../../../core/models/student.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
//import { SearchFilterComponent, FilterField } from '../../../shared/components/search-filter/search-filter.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { StudentFilterComponent, StudentFilter } from '../student-filter/student-filter.component';

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
    MatSnackBarModule,
    MatMenuModule,
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

  /// Configuração de paginação.
  page = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  /// Campos do filtro de alunos.
  // filterFields: FilterField[] = [
  //   {
  //     key: 'name',
  //     label: 'Nome',
  //     type: 'text',
  //     placeholder: 'Digite para buscar pelo nome'
  //   },
  //   {
  //     key: 'email',
  //     label: 'E-mail',
  //     type: 'text',
  //     placeholder: 'Digite para buscar pelo e-mail'
  //   },
  //   {
  //     key: 'status',
  //     label: 'Status',
  //     type: 'select',
  //     options: [
  //       { value: StudentStatus.Active, label: 'Ativo' },
  //       { value: StudentStatus.Inactive, label: 'Inativo' },
  //       { value: StudentStatus.Blocked, label: 'Bloqueado' }
  //     ]
  //   }
  // ];

  constructor(
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /// Exibe mensagem de sucesso via snackbar.
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: 'snack-success'
    });
  }

  /// Exibe mensagem de erro via snackbar.
  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: 'snack-error'
    });
  }

  /// Carrega a lista de alunos ativos do sistema.
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
        this.showError('Erro ao carregar alunos.');
      }
    });
  }

  /// Aplica os filtros recebidos do componente SearchFilter.
  // onFilterApplied(filters: Record<string, any>): void {
  //   this.filteredStudents = this.students.filter(student => {

  //     /// Filtra pelo nome se preenchido.
  //     if (filters['name'] && !student.name.toLowerCase()
  //       .includes(filters['name'].toLowerCase())) return false;

  //     /// Filtra pelo e-mail se preenchido.
  //     if (filters['email'] && !student.email.toLowerCase()
  //       .includes(filters['email'].toLowerCase())) return false;

  //     /// Filtra pelo status se selecionado.
  //     if (filters['status'] && student.status !== filters['status']) return false;

  //     return true;
  //   });

    /// Volta para a primeira página ao filtrar.
    //this.page = 1;
    //this.updatePagination();
  //}

  /// Limpa os filtros e restaura a lista completa.
  // onFilterCleared(): void {
  //   this.filteredStudents = this.students;
  //   this.page = 1;
  //   this.updatePagination();
  // }

  /// Aplica o filtro tipado recebido do StudentFilterComponent.
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

  /// Atualiza os dados de paginação e fatia a lista para a página atual.
  private updatePagination(): void {
    this.totalElements = this.filteredStudents.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedStudents = this.filteredStudents.slice(start, end);
  }

  /// Navega para a página selecionada no paginator.
  onPageChanged(page: number): void {
    this.page = page;
    this.updatePagination();
  }

  /// Bloqueia um aluno impedindo novos agendamentos.
  onBlock(id: string): void {
    this.studentService.block(id).subscribe({
      next: () => {
        this.showSuccess('Aluno bloqueado com sucesso.');
        this.loadStudents();
      },
      error: () => this.showError('Erro ao bloquear aluno.')
    });
  }

  /// Desbloqueia um aluno permitindo novos agendamentos.
  onUnblock(id: string): void {
    this.studentService.unblock(id).subscribe({
      next: () => {
        this.showSuccess('Aluno desbloqueado com sucesso.');
        this.loadStudents();
      },
      error: () => this.showError('Erro ao desbloquear aluno.')
    });
  }

  /// Inativa um aluno via soft delete.
  onDeactivate(id: string): void {
    this.studentService.deactivate(id).subscribe({
      next: () => {
        this.showSuccess('Aluno inativado com sucesso.');
        this.loadStudents();
      },
      error: () => this.showError('Erro ao inativar aluno.')
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

  /// Retorna o label do status do aluno formatado para exibição.
  getStatusLabel(status: StudentStatus): string {
    const labels: Record<StudentStatus, string> = {
      [StudentStatus.Active]: 'Ativo',
      [StudentStatus.Inactive]: 'Inativo',
      [StudentStatus.Blocked]: 'Bloqueado'
    };
    return labels[status];
  }
}
