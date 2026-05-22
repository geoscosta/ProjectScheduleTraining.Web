import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlanService } from '../../../core/services/plan/plan.service';
import { PlanSummary, PlanType, WeeklyFrequency } from '../../../core/models/plan.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { PlanFilterComponent, PlanFilter } from '../plan-filter/plan-filter.component';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PaginatorComponent,
    BadgeComponent,
    AppButtonComponent,
    PlanFilterComponent
  ],
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.scss'
})
export class PlanListComponent implements OnInit {

  plans: PlanSummary[] = [];
  filteredPlans: PlanSummary[] = [];
  pagedPlans: PlanSummary[] = [];
  isLoading = true;

  /// Configuração de paginação.
  page = 1;
  pageSize = 9;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private planService: PlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  /// Exibe mensagem de sucesso via snackbar.
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-success' });
  }

  /// Exibe mensagem de erro via snackbar.
  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-error' });
  }

  /// Carrega a lista de planos ativos do sistema.
  loadPlans(): void {
    this.isLoading = true;
    this.planService.getAll().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.filteredPlans = plans;
        this.updatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Erro ao carregar planos.');
      }
    });
  }

  /// Aplica o filtro tipado recebido do PlanFilterComponent.
  onFilterApplied(filter: PlanFilter): void {
    this.filteredPlans = this.plans.filter(plan => {
      /// Filtra pelo nome se preenchido.
      if (filter.name && !plan.name.toLowerCase()
        .includes(filter.name.toLowerCase())) return false;
      /// Filtra pelo tipo se selecionado.
      if (filter.type !== null && plan.type !== filter.type) return false;
      /// Filtra pela frequência se selecionada.
      if (filter.weeklyFrequency !== null &&
        plan.weeklyFrequency !== filter.weeklyFrequency) return false;
      return true;
    });
    this.page = 1;
    this.updatePagination();
  }

  /// Limpa os filtros e restaura a lista completa.
  onFilterCleared(): void {
    this.filteredPlans = this.plans;
    this.page = 1;
    this.updatePagination();
  }

  /// Atualiza os dados de paginação e fatia a lista para a página atual.
  private updatePagination(): void {
    this.totalElements = this.filteredPlans.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    const start = (this.page - 1) * this.pageSize;
    this.pagedPlans = this.filteredPlans.slice(start, start + this.pageSize);
  }

  /// Navega para a página selecionada no paginator.
  onPageChanged(page: number): void {
    this.page = page;
    this.updatePagination();
  }

  /// Desativa um plano no sistema.
  onDeactivate(id: string): void {
    this.planService.deactivate(id).subscribe({
      next: () => {
        this.showSuccess('Plano desativado com sucesso.');
        this.loadPlans();
      },
      error: () => this.showError('Erro ao desativar plano.')
    });
  }

  /// Retorna o label do tipo do plano.
  getPlanTypeLabel(type: PlanType): string {
    const labels: Record<PlanType, string> = {
      [PlanType.Monthly]: 'Mensal',
      [PlanType.Quarterly]: 'Trimestral',
      [PlanType.SemiAnnual]: 'Semestral',
      [PlanType.Annual]: 'Anual',
      [PlanType.ComboStrengthPilates]: 'Combo',
      [PlanType.Family]: 'Família'
    };
    return labels[type];
  }

  /// Retorna o label da frequência semanal.
  getFrequencyLabel(frequency: WeeklyFrequency): string {
    const labels: Record<WeeklyFrequency, string> = {
      [WeeklyFrequency.TwiceAWeek]: '2x por semana',
      [WeeklyFrequency.ThreeTimesAWeek]: '3x por semana',
      [WeeklyFrequency.FiveTimesAWeek]: '5x por semana'
    };
    return labels[frequency];
  }
}
