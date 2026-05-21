import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { PlanService } from '../../../core/services/plan/plan.service';
import { PlanType, WeeklyFrequency } from '../../../core/models/plan.model';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss'
})
export class PlanFormComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  planId: string | null = null;

  /// Opções de tipo de plano para o select.
  planTypes = [
    { value: PlanType.Monthly, label: 'Mensal' },
    { value: PlanType.Quarterly, label: 'Trimestral' },
    { value: PlanType.SemiAnnual, label: 'Semestral' },
    { value: PlanType.Annual, label: 'Anual' },
    { value: PlanType.ComboStrengthPilates, label: 'Combo Musculação + Pilates' },
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
    /// Inicializa o formulário com as validações necessárias.
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', [Validators.required]],
      weeklyFrequency: ['', [Validators.required]],
      durationMonths: ['', [Validators.required, Validators.min(1)]],
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

        /// Desabilita campos que não podem ser alterados em modo de edição.
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
            'Fechar',
            { duration: 3000 }
          );
        }
      });
    } else {
      this.planService.create(this.form.value).subscribe({
        next: () => {
          this.snackBar.open('Plano criado com sucesso.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/plans']);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open(
            err.error?.errors?.[0] || 'Erro ao criar plano.',
            'Fechar',
            { duration: 3000 }
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
