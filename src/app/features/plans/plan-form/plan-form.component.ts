import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { PlanService } from '../../../core/services/plan/plan.service';
import { PlanType, WeeklyFrequency } from '../../../core/models/plan.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/// Mapeamento de tipo de plano para duração em meses.
const PLAN_TYPE_DURATION: Record<PlanType, number> = {
  [PlanType.Monthly]: 1,
  [PlanType.Quarterly]: 3,
  [PlanType.SemiAnnual]: 6,
  [PlanType.Annual]: 12,
  [PlanType.ComboStrengthPilates]: 1,
  [PlanType.Family]: 1
};

/// Sugestões de nomes por tipo de plano baseados no Estúdio Trinca.
const PLAN_TYPE_NAME_SUGGESTIONS: Record<PlanType, string[]> = {
  [PlanType.Monthly]: [
    'Plano Mensal Pilates 2x',
    'Plano Mensal Pilates 3x',
    'Plano Mensal Personal 2x',
    'Plano Mensal Personal 3x',
    'Plano Mensal Personal 5x'
  ],
  [PlanType.Quarterly]: [
    'Plano Disciplina Pilates 2x',
    'Plano Disciplina Pilates 3x',
    'Plano Disciplina Personal 2x',
    'Plano Disciplina Personal 3x',
    'Plano Disciplina Personal 5x'
  ],
  [PlanType.SemiAnnual]: [
    'Plano Constância Pilates 2x',
    'Plano Constância Pilates 3x',
    'Plano Constância Personal 2x',
    'Plano Constância Personal 3x',
    'Plano Constância Personal 5x'
  ],
  [PlanType.Annual]: [
    'Plano Foco Total Pilates 2x',
    'Plano Foco Total Pilates 3x',
    'Plano Foco Total Personal 3x',
    'Plano Foco Total Personal 5x'
  ],
  [PlanType.ComboStrengthPilates]: [
    'Combo Pilates 2x + Personal 2x',
    'Combo Pilates 2x + Personal 3x',
    'Combo Pilates 3x + Personal 2x'
  ],
  [PlanType.Family]: [
    'Plano Família Pilates 2x',
    'Plano Família Pilates 3x',
    'Plano Família Personal 2x',
    'Plano Família Personal 3x',
    'Plano Família Personal 5x'
  ]
};

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss'
})
export class PlanFormComponent implements OnInit, OnDestroy {

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  planId: string | null = null;

  /// Sugestões de nome baseadas no tipo selecionado.
  nameSuggestions: string[] = [];

  /// Subject para cancelar subscriptions ao destruir o componente.
  private destroy$ = new Subject<void>();

  /// Opções de tipo de plano para o select.
  planTypes = [
    { value: PlanType.Monthly, label: 'Mensal' },
    { value: PlanType.Quarterly, label: 'Trimestral — Plano Disciplina' },
    { value: PlanType.SemiAnnual, label: 'Semestral — Plano Constância' },
    { value: PlanType.Annual, label: 'Anual — Plano Foco Total' },
    { value: PlanType.ComboStrengthPilates, label: 'Combo Pilates + Personal' },
    { value: PlanType.Family, label: 'Família' }
  ];

  /// Opções de frequência semanal para o select.
  weeklyFrequencies = [
    { value: WeeklyFrequency.TwiceAWeek, label: '2x por semana' },
    { value: WeeklyFrequency.ThreeTimesAWeek, label: '3x por semana' },
    { value: WeeklyFrequency.FiveTimesAWeek, label: '5x por semana' }
  ];

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: [null, [Validators.required]],
      weeklyFrequency: [null, [Validators.required]],
      durationMonths: [{ value: 1, disabled: true }],
      price: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.planId;

    if (this.isEditMode) {
      this.loadPlan();
    }

    /// Monitora mudanças no tipo do plano para:
    /// 1. Preencher automaticamente a duração em meses
    /// 2. Atualizar as sugestões de nome
    this.form.get('type')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((type: PlanType) => {
      if (type !== null) {
        const duration = PLAN_TYPE_DURATION[type];
        this.form.get('durationMonths')?.setValue(duration);
        this.nameSuggestions = PLAN_TYPE_NAME_SUGGESTIONS[type] || [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /// Carrega os dados do plano para edição.
  private loadPlan(): void {
    this.isLoading = true;
    this.planService.getById(this.planId!).subscribe({
      next: (plan) => {
        this.form.patchValue({
          name: plan.name,
          type: plan.type,
          weeklyFrequency: plan.weeklyFrequency,
          durationMonths: plan.durationMonths,
          price: plan.price,
          description: plan.description
        });
        this.form.get('type')?.disable();
        this.form.get('weeklyFrequency')?.disable();
        this.form.get('durationMonths')?.disable();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar plano.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/plans']);
      }
    });
  }

  /// Seleciona uma sugestão de nome e preenche o campo automaticamente.
  selectNameSuggestion(name: string): void {
    this.form.get('name')?.setValue(name);
  }

  /// Retorna o label de duração formatado para exibição.
  getDurationLabel(type: PlanType): string {
    const labels: Record<PlanType, string> = {
      [PlanType.Monthly]: '1 mês',
      [PlanType.Quarterly]: '3 meses',
      [PlanType.SemiAnnual]: '6 meses',
      [PlanType.Annual]: '12 meses',
      [PlanType.ComboStrengthPilates]: '1 mês',
      [PlanType.Family]: '1 mês'
    };
    return labels[type] || '1 mês';
  }

  /// Salva o plano — cria ou atualiza conforme o modo.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    if (this.isEditMode) {
      const updateRequest = {
        name: this.form.get('name')?.value,
        price: this.form.get('price')?.value,
        description: this.form.get('description')?.value
      };

      this.planService.update(this.planId!, updateRequest).subscribe({
        next: () => {
          this.snackBar.open('Plano atualizado com sucesso.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/plans']);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open(
            err.error?.errors?.[0] || 'Erro ao atualizar plano.',
            'Fechar', { duration: 3000 }
          );
        }
      });
    } else {
      const createRequest = {
        ...this.form.getRawValue()
      };

      this.planService.create(createRequest).subscribe({
        next: () => {
          this.snackBar.open('Plano criado com sucesso.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/plans']);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open(
            err.error?.errors?.[0] || 'Erro ao criar plano.',
            'Fechar', { duration: 3000 }
          );
        }
      });
    }
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/plans']);
  }
}
