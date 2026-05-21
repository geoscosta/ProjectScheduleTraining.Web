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
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';
import { ScheduleSummary, ScheduleStatus } from '../../../core/models/schedule.model';

@Component({
  selector: 'app-schedule-list',
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
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.scss'
})
export class ScheduleListComponent implements OnInit {

  displayedColumns = ['date', 'startTime', 'endTime', 'availableSlots', 'status', 'actions'];
  schedules: ScheduleSummary[] = [];
  isLoading = false;
  selectedDate: Date = new Date();
  ScheduleStatus = ScheduleStatus;

  constructor(
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  /// Carrega os horários da data selecionada.
  loadSchedules(): void {
    this.isLoading = true;
    const dateStr = this.selectedDate.toISOString().split('T')[0];

    this.scheduleService.getByDate(dateStr).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar horários.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Atualiza a data selecionada e recarrega os horários.
  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadSchedules();
  }

  /// Cancela um horário na agenda.
  onCancel(id: string): void {
    this.scheduleService.cancel(id).subscribe({
      next: () => {
        this.snackBar.open('Horário cancelado com sucesso.', 'Fechar', { duration: 3000 });
        this.loadSchedules();
      },
      error: () => this.snackBar.open('Erro ao cancelar horário.', 'Fechar', { duration: 3000 })
    });
  }

  /// Bloqueia um horário na agenda.
  onBlock(id: string): void {
    this.scheduleService.block(id, {}).subscribe({
      next: () => {
        this.snackBar.open('Horário bloqueado com sucesso.', 'Fechar', { duration: 3000 });
        this.loadSchedules();
      },
      error: () => this.snackBar.open('Erro ao bloquear horário.', 'Fechar', { duration: 3000 })
    });
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

  /// Retorna a classe CSS do badge de status.
  getStatusClass(status: ScheduleStatus): string {
    const classes: Record<ScheduleStatus, string> = {
      [ScheduleStatus.Available]: 'bg-green-100 text-green-700',
      [ScheduleStatus.Full]: 'bg-red-100 text-red-700',
      [ScheduleStatus.Blocked]: 'bg-yellow-100 text-yellow-700',
      [ScheduleStatus.Cancelled]: 'bg-gray-100 text-gray-700'
    };
    return classes[status];
  }
}
