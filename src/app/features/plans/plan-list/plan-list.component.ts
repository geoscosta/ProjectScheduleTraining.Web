import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlanService } from '../../../core/services/plan/plan.service';
import { PlanSummary, PlanType, WeeklyFrequency } from '../../../core/models/plan.model';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.scss'
})
export class PlanListComponent implements OnInit {

  displayedColumns = ['name', 'type', 'frequency', 'duration', 'price', 'actions'];
  plans: PlanSummary[] = [];
  isLoading = true;

  constructor(
    private planService: PlanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  /// Carrega a lista de planos ativos do sistema.
  loadPlans(): void {
    this.isLoading = true;
    this.planService.getAll().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar planos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Desativa um plano no sistema.
  onDeactivate(id: string): void {
    this.planService.deactivate(id).subscribe({
      next: () => {
        this.snackBar.open('Plano desativado com sucesso.', 'Fechar', { duration: 3000 });
        this.loadPlans();
      },
      error: () => this.snackBar.open('Erro ao desativar plano.', 'Fechar', { duration: 3000 })
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
