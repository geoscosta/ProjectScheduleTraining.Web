import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService } from '../../core/services/student/student.service';
import { FinancialService } from '../../core/services/financial/financial.service';
import { ScheduleService } from '../../core/services/schedule/schedule.service';
import { StudentSummary } from '../../core/models/student.model';
import { FinancialSummary } from '../../core/models/financial.model';
import { ScheduleSummary } from '../../core/models/schedule.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  isLoading = true;
  activeStudents: StudentSummary[] = [];
  overdueFinancials: FinancialSummary[] = [];
  todaySchedules: ScheduleSummary[] = [];
  today = new Date();

  constructor(
    private studentService: StudentService,
    private financialService: FinancialService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /// Carrega todos os dados necessários para o dashboard.
  private loadDashboardData(): void {
    const today = new Date().toISOString().split('T')[0];

    this.studentService.getAll().subscribe({
      next: (students) => {
        this.activeStudents = students;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.financialService.getOverdue().subscribe({
      next: (financials) => {
        this.overdueFinancials = financials;
      }
    });

    this.scheduleService.getByDate(today).subscribe({
      next: (schedules) => {
        this.todaySchedules = schedules;
      }
    });
  }

  /// Retorna o total de vagas disponíveis hoje.
  get totalAvailableSlots(): number {
    return this.todaySchedules.reduce((acc, s) => acc + s.availableSlots, 0);
  }
}
