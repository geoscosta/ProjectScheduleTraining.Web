import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';

/// Tipos de férias conforme contrato.
enum VacationType {
  OneMonth    = 1,
  FifteenDays = 2
}

/// Modelo de férias do aluno.
interface StudentVacation {
  id: string;
  studentId: string;
  enrollmentId: string;
  vacationType: VacationType;
  startDate: string;
  endDate: string;
  billingAmount: number;
  isApproved: boolean;
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-student-vacations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    BadgeComponent
  ],
  templateUrl: './student-vacations.component.html',
  styleUrl: './student-vacations.component.scss'
})
export class StudentVacationsComponent implements OnInit {

  studentId = '';
  enrollmentId = '';
  isLoading = true;
  isSaving = false;
  showForm = false;
  vacations: StudentVacation[] = [];
  form!: FormGroup;
  VacationType = VacationType;

  /// Data mínima para início das férias (hoje + 30 dias de aviso).
  minStartDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  /// Opções de tipo de férias.
  vacationTypeOptions = [
    {
      value: VacationType.OneMonth,
      label: 'Férias de 1 mês',
      description: 'Pagamento normal. Aviso obrigatório com 30 dias de antecedência.',
      billing: '100% da mensalidade'
    },
    {
      value: VacationType.FifteenDays,
      label: 'Férias de 15 dias',
      description: 'Pagamento de 50% da mensalidade para garantir a vaga.',
      billing: '50% da mensalidade'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    this.buildForm();
    this.loadData();
  }

  /// Constrói o formulário de solicitação de férias.
  private buildForm(): void {
    this.form = this.fb.group({
      vacationType: [null, Validators.required],
      startDate: [null, Validators.required],
      notes: ['']
    });

    /// Calcula a data de término automaticamente pelo tipo de férias.
    this.form.get('vacationType')?.valueChanges.subscribe(() => {
      const start = this.form.get('startDate')?.value;
      if (start) this.calculateEndDate(start);
    });

    this.form.get('startDate')?.valueChanges.subscribe(date => {
      if (date) this.calculateEndDate(date);
    });
  }

  /// Calcula a data de término com base no tipo e início.
  private calculateEndDate(startDate: Date): void {
    const type = this.form.get('vacationType')?.value;
    if (!type || !startDate) return;

    const end = new Date(startDate);
    if (type === VacationType.OneMonth) {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setDate(end.getDate() + 15);
    }

    this.form.patchValue({ endDate: end }, { emitEvent: false });
  }

  /// Retorna a data de término calculada para exibição.
  get calculatedEndDate(): Date | null {
    const start = this.form.get('startDate')?.value;
    const type = this.form.get('vacationType')?.value;
    if (!start || !type) return null;

    const end = new Date(start);
    if (type === VacationType.OneMonth) {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setDate(end.getDate() + 15);
    }
    return end;
  }

  /// Retorna o percentual de cobrança conforme o tipo de férias.
  get billingInfo(): string {
    const type = this.form.get('vacationType')?.value;
    if (!type) return '';
    return type === VacationType.OneMonth
      ? '100% da mensalidade (pagamento normal)'
      : '50% da mensalidade (para garantir a vaga)';
  }

  /// Carrega férias existentes e matrícula ativa do aluno.
  private loadData(): void {
    this.isLoading = true;

    /// Busca a matrícula ativa para obter o enrollmentId.
    this.http.get<any>(`${environment.apiUrl}/Enrollments/student/${this.studentId}`)
      .subscribe({
        next: (enrollment) => {
          this.enrollmentId = enrollment.id;
          this.loadVacations();
        },
        error: () => {
          this.isLoading = false;
          this.notification.error('Aluno não possui matrícula ativa.');
        }
      });
  }

  /// Carrega o histórico de férias do aluno.
  private loadVacations(): void {
    this.http.get<StudentVacation[]>(
      `${environment.apiUrl}/StudentVacations/student/${this.studentId}`
    ).subscribe({
      next: (vacations) => {
        this.vacations = vacations;
        this.isLoading = false;
      },
      error: () => {
        this.vacations = [];
        this.isLoading = false;
      }
    });
  }

  /// Retorna o badge type conforme o status de aprovação.
  getStatusBadge(isApproved: boolean): BadgeType {
    return isApproved ? 'success' : 'warning';
  }

  /// Retorna o label de status.
  getStatusLabel(isApproved: boolean): string {
    return isApproved ? 'Aprovado' : 'Aguardando aprovação';
  }

  /// Retorna o label do tipo de férias.
  getVacationTypeLabel(type: VacationType): string {
    return type === VacationType.OneMonth ? 'Férias de 1 mês' : 'Férias de 15 dias';
  }

  /// Submete a solicitação de férias.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    const payload = {
      studentId: this.studentId,
      enrollmentId: this.enrollmentId,
      vacationType: this.form.get('vacationType')?.value,
      startDate: this.form.get('startDate')?.value,
      endDate: this.calculatedEndDate,
      notes: this.form.get('notes')?.value || null
    };

    this.http.post<StudentVacation>(
      `${environment.apiUrl}/StudentVacations`,
      payload
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.showForm = false;
        this.notification.success('Solicitação de férias enviada com sucesso.');
        this.loadVacations();
      },
      error: (err) => {
        this.isSaving = false;
        this.notification.error(
          err.error?.errors?.[0] || 'Erro ao solicitar férias.'
        );
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/students', this.studentId]);
  }
}
