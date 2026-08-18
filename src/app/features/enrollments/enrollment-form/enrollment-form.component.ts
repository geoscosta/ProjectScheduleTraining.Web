import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { StudentService } from '../../../core/services/student/student.service';
import { PlanService } from '../../../core/services/plan/plan.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { StudentSummary, StudentStatus } from '../../../core/models/student.model';
import { PlanSummary, PlanType } from '../../../core/models/plan.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/// Tipos de plano com fidelidade que possuem desconto.
const LOYALTY_PLAN_TYPES = [PlanType.Quarterly, PlanType.SemiAnnual, PlanType.Annual];

/// Mapeamento de desconto por tipo de plano e método de pagamento.
const DISCOUNT_MAP: Record<number, { cash: number; card: number }> = {
  [PlanType.Quarterly]:  { cash: 10, card: 5 },
  [PlanType.SemiAnnual]: { cash: 15, card: 5 },
  [PlanType.Annual]:     { cash: 20, card: 10 }
};

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './enrollment-form.component.html',
  styleUrl: './enrollment-form.component.scss'
})
export class EnrollmentFormComponent implements OnInit {

  form: FormGroup;
  isLoading = true;
  isSaving = false;

  students: StudentSummary[] = [];
  activeStudents: StudentSummary[] = [];
  plans: PlanSummary[] = [];
  activePlans: PlanSummary[] = [];

  selectedPlan: PlanSummary | null = null;
  discountPercentage = 0;
  finalPrice = 0;
  isLoyaltyPlan = false;

  private destroy$ = new Subject<void>();
  private loadedCount = 0;

  /// Opções de dia de vencimento conforme contrato (5, 10, 15 ou 20).
  dueDayOptions = [
    { value: 5,  label: 'Dia 5' },
    { value: 10, label: 'Dia 10' },
    { value: 15, label: 'Dia 15' },
    { value: 20, label: 'Dia 20' }
  ];

  /// Opções de método de pagamento.
  paymentMethodOptions = [
    { value: 1, label: '💵 À vista', hint: 'Maior desconto' },
    { value: 3, label: '📱 PIX',     hint: 'Equivalente à vista' },
    { value: 2, label: '💳 Cartão',  hint: 'Desconto menor' }
  ];

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private planService: PlanService,
    private router: Router,
    private notification: NotificationService
  ) {
    this.form = this.fb.group({
      studentId:     ['', [Validators.required]],
      planId:        ['', [Validators.required]],
      paymentDueDay: [null, [Validators.required]],
      paymentMethod: [1, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData();

    /// Monitora mudanças no plano para calcular desconto.
    this.form.get('planId')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(planId => {
      this.selectedPlan = this.activePlans.find(p => p.id === planId) || null;
      this.isLoyaltyPlan = this.selectedPlan
        ? LOYALTY_PLAN_TYPES.includes(this.selectedPlan.type)
        : false;
      this.calculateDiscount();
    });

    /// Recalcula desconto ao mudar o método de pagamento.
    this.form.get('paymentMethod')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.calculateDiscount());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /// Calcula o desconto e preço final conforme plano e método de pagamento.
  private calculateDiscount(): void {
    if (!this.selectedPlan) {
      this.discountPercentage = 0;
      this.finalPrice = 0;
      return;
    }

    const method = this.form.get('paymentMethod')?.value;
    const isCash = method === 1 || method === 3;
    const map = DISCOUNT_MAP[this.selectedPlan.type];

    this.discountPercentage = map
      ? (isCash ? map.cash : map.card)
      : 0;

    this.finalPrice = Number(
      (this.selectedPlan.price * (1 - this.discountPercentage / 100)).toFixed(2)
    );
  }

  /// Retorna o label do desconto formatado para exibição.
  get discountLabel(): string {
    if (!this.isLoyaltyPlan || this.discountPercentage === 0) return '';
    return `${this.discountPercentage}% de desconto aplicado`;
  }

  /// Retorna a economia gerada pelo desconto.
  get savingsAmount(): number {
    if (!this.selectedPlan) return 0;
    return Number((this.selectedPlan.price - this.finalPrice).toFixed(2));
  }

  /// Carrega alunos e planos em paralelo.
  private loadData(): void {
    this.isLoading = true;

    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        /// Exibe apenas alunos ativos para matrícula.
        this.activeStudents = students.filter(s => s.status === StudentStatus.Active);
        this.checkLoadingComplete();
      },
      error: () => {
        this.notification.error('Erro ao carregar alunos.');
        this.checkLoadingComplete();
      }
    });

    this.planService.getAll().subscribe({
      next: (plans) => {
        this.plans = plans;
        /// Exibe apenas planos ativos.
        this.activePlans = plans.filter(p => p.isActive);
        this.checkLoadingComplete();
      },
      error: () => {
        this.notification.error('Erro ao carregar planos.');
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    this.loadedCount++;
    if (this.loadedCount >= 2) this.isLoading = false;
  }

  /// Retorna o label do tipo do plano para exibição.
  getPlanTypeLabel(type: PlanType): string {
    const labels: Record<number, string> = {
      [PlanType.Monthly]:            'Mensal',
      [PlanType.Quarterly]:          'Trimestral',
      [PlanType.SemiAnnual]:         'Semestral',
      [PlanType.Annual]:             'Anual',
      [PlanType.ComboStrengthPilates]: 'Combo',
      [PlanType.Family]:             'Família'
    };
    return labels[type] || '';
  }

  /// Cria a matrícula.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.enrollmentService.create(this.form.value).subscribe({
      next: () => {
        this.notification.success('Matrícula criada com sucesso.');
        this.router.navigate(['/enrollments']);
      },
      error: (err) => {
        this.isSaving = false;
        this.notification.error(err.error?.errors?.[0] || 'Erro ao criar matrícula.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/enrollments']);
  }
}
