import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StudentService } from '../../core/services/student/student.service';
import { FinancialService } from '../../core/services/financial/financial.service';
import { ScheduleService } from '../../core/services/schedule/schedule.service';
import { StudentSummary } from '../../core/models/student.model';
import { FinancialSummary } from '../../core/models/financial.model';
import { ScheduleSummary, ScheduleStatus } from '../../core/models/schedule.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    PageHeaderComponent,
    StatCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  isLoading = true;
  today = new Date();
  ScheduleStatus = ScheduleStatus;

  activeStudents: StudentSummary[] = [];
  overdueFinancials: FinancialSummary[] = [];
  todaySchedules: ScheduleSummary[] = [];

  constructor(
    private studentService: StudentService,
    private financialService: FinancialService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /// Carrega todos os dados do dashboard em paralelo.
  /// Utiliza três requisições simultâneas para melhor performance.
  private loadDashboardData(): void {
    const today = new Date().toISOString().split('T')[0];
    let loadedCount = 0;
    const totalRequests = 3;

    /// Marca o loading como concluído após todas as requisições finalizarem.
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalRequests) {
        this.isLoading = false;
      }
    };

    /// Carrega os alunos ativos do sistema.
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.activeStudents = students;
        checkComplete();
      },
      error: () => checkComplete()
    });

    /// Carrega as cobranças vencidas para controle de inadimplência.
    this.financialService.getOverdue().subscribe({
      next: (financials) => {
        this.overdueFinancials = financials;
        checkComplete();
      },
      error: () => checkComplete()
    });

    /// Carrega os horários do dia atual para exibição na agenda.
    this.scheduleService.getByDate(today).subscribe({
      next: (schedules) => {
        this.todaySchedules = schedules;
        checkComplete();
      },
      error: () => checkComplete()
    });
  }

  /// Calcula o total de vagas disponíveis em todos os horários do dia.
  get totalAvailableSlots(): number {
    return this.todaySchedules.reduce((acc, s) => acc + s.availableSlots, 0);
  }

  /// Retorna o label de status do horário formatado para exibição.
  getScheduleStatusLabel(status: ScheduleStatus): string {
    const labels: Record<ScheduleStatus, string> = {
      [ScheduleStatus.Available]: 'Disponível',
      [ScheduleStatus.Full]: 'Lotada',
      [ScheduleStatus.Blocked]: 'Bloqueada',
      [ScheduleStatus.Cancelled]: 'Cancelada'
    };
    return labels[status];
  }

  /// Retorna as classes CSS do badge de status do horário.
  getScheduleStatusClass(status: ScheduleStatus): string {
    const classes: Record<ScheduleStatus, string> = {
      [ScheduleStatus.Available]: 'bg-green-100 text-green-700',
      [ScheduleStatus.Full]: 'bg-red-100 text-red-700',
      [ScheduleStatus.Blocked]: 'bg-yellow-100 text-yellow-700',
      [ScheduleStatus.Cancelled]: 'bg-gray-100 text-gray-700'
    };
    return classes[status];
  }
}
