import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SchedulingService } from '../../../core/services/scheduling/scheduling.service';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';
import { SchedulingSummary, SchedulingStatus } from '../../../core/models/scheduling.model';
import { ScheduleSummary } from '../../../core/models/schedule.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { SchedulingFilterComponent, SchedulingFilter } from '../scheduling-filter/scheduling-filter.component';

@Component({
  selector: 'app-scheduling-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    BadgeComponent,
    AppButtonComponent,
    SchedulingFilterComponent
  ],
  templateUrl: './scheduling-list.component.html',
  styleUrl: './scheduling-list.component.scss'
})
export class SchedulingListComponent implements OnInit {

  schedulings: SchedulingSummary[] = [];
  schedules: ScheduleSummary[] = [];
  isLoading = false;
  selectedScheduleId = '';
  SchedulingStatus = SchedulingStatus;

  constructor(
    private schedulingService: SchedulingService,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSchedulesByDate(new Date());
  }

  /// Exibe mensagem de sucesso via snackbar.
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-success' });
  }

  /// Exibe mensagem de erro via snackbar.
  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-error' });
  }

  /// Carrega os horários disponíveis da data informada.
  private loadSchedulesByDate(date: Date): void {
    const dateStr = date.toISOString().split('T')[0];
    this.scheduleService.getByDate(dateStr).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.selectedScheduleId = '';
        this.schedulings = [];
      }
    });
  }

  /// Aplica o filtro recebido do SchedulingFilterComponent.
  onFilterApplied(filter: SchedulingFilter): void {
    if (filter.date) {
      this.loadSchedulesByDate(filter.date);
    }
  }

  /// Limpa o filtro e carrega a data atual.
  onFilterCleared(): void {
    this.loadSchedulesByDate(new Date());
  }

  /// Carrega os agendamentos do horário selecionado.
  onScheduleChange(scheduleId: string): void {
    if (!scheduleId) return;
    this.isLoading = true;
    this.schedulingService.getByScheduleId(scheduleId).subscribe({
      next: (schedulings) => {
        this.schedulings = schedulings;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Erro ao carregar agendamentos.');
      }
    });
  }

  /// Registra a presença de um aluno na aula.
  onCheckIn(id: string): void {
    this.schedulingService.checkIn(id, {}).subscribe({
      next: () => {
        this.showSuccess('Presença registrada com sucesso.');
        this.onScheduleChange(this.selectedScheduleId);
      },
      error: () => this.showError('Erro ao registrar presença.')
    });
  }

  /// Cancela um agendamento e libera a vaga.
  onCancel(id: string): void {
    this.schedulingService.cancel(id).subscribe({
      next: () => {
        this.showSuccess('Agendamento cancelado com sucesso.');
        this.onScheduleChange(this.selectedScheduleId);
      },
      error: () => this.showError('Erro ao cancelar agendamento.')
    });
  }

  /// Retorna o tipo do badge baseado no status do agendamento.
  getStatusBadgeType(status: SchedulingStatus): BadgeType {
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
  getStatusLabel(status: SchedulingStatus): string {
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
}
