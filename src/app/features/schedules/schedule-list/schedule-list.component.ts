import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';
import { ScheduleSummary, ScheduleStatus } from '../../../core/models/schedule.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { ScheduleFilterComponent, ScheduleFilter } from '../schedule-filter/schedule-filter.component';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    BadgeComponent,
    AppButtonComponent,
    ScheduleFilterComponent
  ],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.scss'
})
export class ScheduleListComponent implements OnInit {

  schedules: ScheduleSummary[] = [];
  isLoading = false;
  ScheduleStatus = ScheduleStatus;

  constructor(
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadByDate(new Date());
  }

  /// Exibe mensagem de sucesso via snackbar.
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-success' });
  }

  /// Exibe mensagem de erro via snackbar.
  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-error' });
  }

  /// Carrega os horários da data informada.
  private loadByDate(date: Date): void {
    this.isLoading = true;
    const dateStr = date.toISOString().split('T')[0];
    this.scheduleService.getByDate(dateStr).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Erro ao carregar horários.');
      }
    });
  }

  /// Aplica o filtro recebido do ScheduleFilterComponent.
  onFilterApplied(filter: ScheduleFilter): void {
    if (filter.date) {
      this.loadByDate(filter.date);
    }
  }

  /// Limpa o filtro e carrega a data atual.
  onFilterCleared(): void {
    this.loadByDate(new Date());
  }

  /// Cancela um horário na agenda.
  onCancel(id: string): void {
    this.scheduleService.cancel(id).subscribe({
      next: () => {
        this.showSuccess('Horário cancelado com sucesso.');
        this.loadByDate(new Date());
      },
      error: () => this.showError('Erro ao cancelar horário.')
    });
  }

  /// Bloqueia um horário na agenda.
  onBlock(id: string): void {
    this.scheduleService.block(id, {}).subscribe({
      next: () => {
        this.showSuccess('Horário bloqueado com sucesso.');
        this.loadByDate(new Date());
      },
      error: () => this.showError('Erro ao bloquear horário.')
    });
  }

  /// Retorna o tipo do badge baseado no status do horário.
  getStatusBadgeType(status: ScheduleStatus): BadgeType {
    const types: Record<ScheduleStatus, BadgeType> = {
      [ScheduleStatus.Available]: 'success',
      [ScheduleStatus.Full]: 'danger',
      [ScheduleStatus.Blocked]: 'warning',
      [ScheduleStatus.Cancelled]: 'neutral'
    };
    return types[status];
  }

  /// Retorna o label do status do horário.
  getStatusLabel(status: ScheduleStatus): string {
    const labels: Record<ScheduleStatus, string> = {
      [ScheduleStatus.Available]: 'Disponível',
      [ScheduleStatus.Full]: 'Lotada',
      [ScheduleStatus.Blocked]: 'Bloqueada',
      [ScheduleStatus.Cancelled]: 'Cancelada'
    };
    return labels[status];
  }
}
