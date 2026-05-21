import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SchedulingService } from '../../../core/services/scheduling/scheduling.service';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';
import { SchedulingSummary, SchedulingStatus } from '../../../core/models/scheduling.model';
import { ScheduleSummary } from '../../../core/models/schedule.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-scheduling-list',
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
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule
  ],
  templateUrl: './scheduling-list.component.html',
  styleUrl: './scheduling-list.component.scss'
})
export class SchedulingListComponent implements OnInit {

  displayedColumns = ['student', 'schedule', 'status', 'isMakeup', 'actions'];
  schedulings: SchedulingSummary[] = [];
  schedules: ScheduleSummary[] = [];
  isLoading = false;
  selectedDate: Date = new Date();
  selectedScheduleId = '';
  SchedulingStatus = SchedulingStatus;

  constructor(
    private schedulingService: SchedulingService,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSchedulesByDate();
  }

  /// Carrega os horários da data selecionada.
  loadSchedulesByDate(): void {
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.scheduleService.getByDate(dateStr).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.selectedScheduleId = '';
        this.schedulings = [];
      }
    });
  }

  /// Atualiza a data e recarrega os horários.
  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadSchedulesByDate();
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
        this.snackBar.open('Erro ao carregar agendamentos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Registra a presença de um aluno.
  onCheckIn(id: string): void {
    this.schedulingService.checkIn(id, {}).subscribe({
      next: () => {
        this.snackBar.open('Presença registrada com sucesso.', 'Fechar', { duration: 3000 });
        this.onScheduleChange(this.selectedScheduleId);
      },
      error: () => this.snackBar.open('Erro ao registrar presença.', 'Fechar', { duration: 3000 })
    });
  }

  /// Cancela um agendamento.
  onCancel(id: string): void {
    this.schedulingService.cancel(id).subscribe({
      next: () => {
        this.snackBar.open('Agendamento cancelado com sucesso.', 'Fechar', { duration: 3000 });
        this.onScheduleChange(this.selectedScheduleId);
      },
      error: () => this.snackBar.open('Erro ao cancelar agendamento.', 'Fechar', { duration: 3000 })
    });
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

  /// Retorna a classe CSS do badge de status.
  getStatusClass(status: SchedulingStatus): string {
    const classes: Record<SchedulingStatus, string> = {
      [SchedulingStatus.Scheduled]: 'bg-blue-100 text-blue-700',
      [SchedulingStatus.Present]: 'bg-green-100 text-green-700',
      [SchedulingStatus.JustifiedAbsence]: 'bg-yellow-100 text-yellow-700',
      [SchedulingStatus.UnjustifiedAbsence]: 'bg-orange-100 text-orange-700',
      [SchedulingStatus.Cancelled]: 'bg-red-100 text-red-700',
      [SchedulingStatus.Makeup]: 'bg-purple-100 text-purple-700'
    };
    return classes[status];
  }
}
