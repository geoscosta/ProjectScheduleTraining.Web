import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { FinancialService } from '../../../core/services/financial/financial.service';
import { StudentService } from '../../../core/services/student/student.service';
import {
  FinancialSummary,
  FinancialStatus,
} from '../../../core/models/financial.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import {
  BadgeComponent,
  BadgeType,
} from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import {
  FinancialFilterComponent,
  FinancialFilter,
} from '../financial-filter/financial-filter.component';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-financial-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatTabsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    BadgeComponent,
    AppButtonComponent,
    PaginatorComponent,
    FinancialFilterComponent,
  ],
  templateUrl: './financial-list.component.html',
  styleUrl: './financial-list.component.scss',
})
export class FinancialListComponent implements OnInit {
  filteredFinancials: FinancialSummary[] = [];
  pagedFinancials: FinancialSummary[] = [];
  overdueFinancials: FinancialSummary[] = [];
  isLoading = false;
  isLoadingOverdue = true;
  FinancialStatus = FinancialStatus;

  page = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  private activeFilter: FinancialFilter | null = null;

  constructor(
    private financialService: FinancialService,
    private studentService: StudentService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadOverdue();
  }

  /// Carrega todas as cobranças vencidas do sistema.
  private loadOverdue(): void {
    this.isLoadingOverdue = true;
    this.financialService.getOverdue().subscribe({
      next: (financials) => {
        this.overdueFinancials = financials;
        this.isLoadingOverdue = false;
      },
      error: () => (this.isLoadingOverdue = false),
    });
  }

  /// Aplica o filtro recebido do FinancialFilterComponent.
  /// Se um aluno foi selecionado busca as cobranças dele no backend.
  /// Caso contrário filtra apenas nas cobranças vencidas.
  onFilterApplied(filter: FinancialFilter): void {
    this.activeFilter = filter;
    this.isLoading = true;

    if (filter.studentId) {
      /// Com aluno selecionado — busca cobranças do aluno.
      this.financialService.getByStudentId(filter.studentId).subscribe({
        next: (financials) => {
          this.filteredFinancials = this.applyLocalFilters(financials, filter);
          this.page = 1;
          this.updatePagination();
          this.isLoading = false;
        },
        error: () => {
          this.filteredFinancials = [];
          this.isLoading = false;
          this.notification.error('Erro ao carregar cobranças do aluno.');
        },
      });
    } else {
      /// Sem aluno — busca todas as cobranças e aplica filtros locais.
      this.financialService.getAll().subscribe({
        next: (financials) => {
          this.filteredFinancials = this.applyLocalFilters(financials, filter);
          this.page = 1;
          this.updatePagination();
          this.isLoading = false;
        },
        error: () => {
          this.filteredFinancials = [];
          this.isLoading = false;
        },
      });
    }
  }

  private applyLocalFilters(
    financials: FinancialSummary[],
    filter: FinancialFilter,
  ): FinancialSummary[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return financials.filter((f) => {
      /// Calcula o status efetivo — pendente com data passada = vencido.
      const dueDate = new Date(f.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const effectiveStatus =
        f.status === FinancialStatus.Pending && dueDate < today
          ? FinancialStatus.Overdue
          : f.status;

      /// Filtra por status usando o status efetivo.
      if (
        filter.status !== null &&
        filter.status !== undefined &&
        effectiveStatus !== filter.status
      )
        return false;

      /// Filtra por data de vencimento início.
      if (filter.dueDateStart) {
        const start = new Date(filter.dueDateStart);
        start.setHours(0, 0, 0, 0);
        if (dueDate < start) return false;
      }

      /// Filtra por data de vencimento fim.
      if (filter.dueDateEnd) {
        const end = new Date(filter.dueDateEnd);
        end.setHours(23, 59, 59, 999);
        if (dueDate > end) return false;
      }

      return true;
    });
  }

  /// Limpa os filtros e a lista de cobranças.
  onFilterCleared(): void {
    this.activeFilter = null;
    this.filteredFinancials = [];
    this.pagedFinancials = [];
    this.totalElements = 0;
    this.totalPages = 0;
  }

  /// Recarrega os dados com o filtro ativo se existir.
  private reloadData(): void {
    this.loadOverdue();
    if (this.activeFilter) {
      this.onFilterApplied(this.activeFilter);
    }
  }

  /// Atualiza os dados de paginação.
  private updatePagination(): void {
    this.totalElements = this.filteredFinancials.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    this.pagedFinancials = this.filteredFinancials.slice(
      start,
      start + this.pageSize,
    );
  }

  onPageChanged(page: number): void {
    this.page = page;
    this.updatePagination();
  }

  /// Registra o pagamento de uma cobrança com confirmação prévia.
  onRegisterPayment(id: string, amount: number): void {
    this.notification
      .confirm({
        title: 'Registrar Pagamento',
        message: `Confirma o recebimento de R$ ${amount.toFixed(2).replace('.', ',')}?`,
        confirmLabel: 'Confirmar Pagamento',
        cancelLabel: 'Cancelar',
        type: 'info',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.financialService.registerPayment(id, {}).subscribe({
          next: () => {
            this.notification.success('Pagamento registrado com sucesso.');
            this.reloadData();
          },
          error: (err) => {
            this.notification.error(
              err.error?.errors?.[0] || 'Erro ao registrar pagamento.',
            );
          },
        });
      });
  }

  /// Cancela uma cobrança financeira com confirmação prévia.
  onCancel(id: string, amount: number): void {
    this.notification
      .confirm({
        title: 'Cancelar Cobrança',
        message: `Tem certeza que deseja cancelar a cobrança de R$ ${amount.toFixed(2).replace('.', ',')}?`,
        confirmLabel: 'Cancelar Cobrança',
        cancelLabel: 'Voltar',
        type: 'danger',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.financialService.cancel(id).subscribe({
          next: () => {
            this.notification.success('Cobrança cancelada com sucesso.');
            this.reloadData();
          },
          error: (err) => {
            this.notification.error(
              err.error?.errors?.[0] || 'Erro ao cancelar cobrança.',
            );
          },
        });
      });
  }

  /// Retorna o tipo do badge baseado no status financeiro.
  getStatusBadgeType(status: FinancialStatus): BadgeType {
    const types: Record<FinancialStatus, BadgeType> = {
      [FinancialStatus.Pending]: 'warning',
      [FinancialStatus.Paid]: 'success',
      [FinancialStatus.Overdue]: 'danger',
      [FinancialStatus.Cancelled]: 'neutral',
      [FinancialStatus.Exempt]: 'info',
    };
    return types[status];
  }

  /// Retorna o label do status financeiro.
  getStatusLabel(status: FinancialStatus): string {
    const labels: Record<FinancialStatus, string> = {
      [FinancialStatus.Pending]: 'Pendente',
      [FinancialStatus.Paid]: 'Pago',
      [FinancialStatus.Overdue]: 'Vencido',
      [FinancialStatus.Cancelled]: 'Cancelado',
      [FinancialStatus.Exempt]: 'Isento',
    };
    return labels[status];
  }
}
