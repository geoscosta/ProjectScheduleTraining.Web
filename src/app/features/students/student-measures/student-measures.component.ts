import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

/// Modelo de medida corporal.
interface StudentMeasure {
  id: string;
  studentId: string;
  measureDate: string;
  weight: number;
  height: number;
  bmi: number;
  chestCircumference?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  armCircumference?: number;
  thighCircumference?: number;
  calfCircumference?: number;
  bodyFatPercentage?: number;
  leanMassPercentage?: number;
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-student-measures',
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
    PageHeaderComponent,
    LoadingSpinnerComponent,
    BadgeComponent
  ],
  templateUrl: './student-measures.component.html',
  styleUrl: './student-measures.component.scss'
})
export class StudentMeasuresComponent implements OnInit {

  studentId = '';
  isLoading = true;
  isSaving = false;
  showForm = false;
  measures: StudentMeasure[] = [];
  latestMeasure: StudentMeasure | null = null;
  form!: FormGroup;

  /// Métrica selecionada para exibir no gráfico.
  selectedMetric: keyof StudentMeasure = 'weight';

  /// Opções de métricas para o gráfico.
  metricOptions = [
    { key: 'weight',             label: 'Peso (kg)',         color: '#6366f1' },
    { key: 'bmi',                label: 'IMC',               color: '#8b5cf6' },
    { key: 'waistCircumference', label: 'Cintura (cm)',      color: '#f59e0b' },
    { key: 'bodyFatPercentage',  label: '% Gordura',         color: '#ef4444' },
    { key: 'leanMassPercentage', label: '% Massa Magra',     color: '#10b981' }
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
    this.loadMeasures();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      measureDate: [new Date(), Validators.required],
      weight:      [null, [Validators.required, Validators.min(1), Validators.max(500)]],
      height:      [null, [Validators.required, Validators.min(1), Validators.max(300)]],
      chestCircumference:  [null],
      waistCircumference:  [null],
      hipCircumference:    [null],
      armCircumference:    [null],
      thighCircumference:  [null],
      calfCircumference:   [null],
      bodyFatPercentage:   [null],
      leanMassPercentage:  [null],
      notes: ['']
    });
  }

  /// Carrega o histórico de medidas do aluno.
  private loadMeasures(): void {
    this.isLoading = true;
    this.http.get<StudentMeasure[]>(
      `${environment.apiUrl}/StudentMeasures/student/${this.studentId}`
    ).subscribe({
      next: (measures) => {
        this.measures = measures;
        this.latestMeasure = measures.length > 0 ? measures[0] : null;
        this.isLoading = false;
      },
      error: () => {
        this.measures = [];
        this.isLoading = false;
      }
    });
  }

  /// Retorna o label do IMC com classificação.
  getBmiLabel(bmi: number): string {
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25)   return 'Peso normal';
    if (bmi < 30)   return 'Sobrepeso';
    return 'Obesidade';
  }

  /// Retorna o tipo do badge do IMC.
  getBmiBadgeType(bmi: number): 'success' | 'warning' | 'danger' | 'info' {
    if (bmi < 18.5) return 'info';
    if (bmi < 25)   return 'success';
    if (bmi < 30)   return 'warning';
    return 'danger';
  }

  /// Retorna a variação de uma métrica entre as duas últimas medições.
  getVariation(metric: keyof StudentMeasure): number | null {
    if (this.measures.length < 2) return null;
    const latest = this.measures[0][metric] as number;
    const previous = this.measures[1][metric] as number;
    if (!latest || !previous) return null;
    return Number((latest - previous).toFixed(2));
  }

  /// Retorna os dados do gráfico para a métrica selecionada.
  get chartData(): { date: string; value: number }[] {
    return this.measures
      .filter(m => m[this.selectedMetric] != null)
      .map(m => ({
        date: new Date(m.measureDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        value: m[this.selectedMetric] as number
      }))
      .reverse();
  }

  /// Retorna o valor máximo do gráfico para escala.
  get chartMax(): number {
    if (this.chartData.length === 0) return 100;
    return Math.max(...this.chartData.map(d => d.value)) * 1.1;
  }

  /// Retorna o valor mínimo do gráfico para escala.
  get chartMin(): number {
    if (this.chartData.length === 0) return 0;
    return Math.min(...this.chartData.map(d => d.value)) * 0.9;
  }

  /// Calcula a altura percentual de uma barra no gráfico.
  getBarHeight(value: number): number {
    const range = this.chartMax - this.chartMin;
    if (range === 0) return 50;
    return ((value - this.chartMin) / range) * 100;
  }

  /// Retorna a cor da métrica selecionada.
  get selectedColor(): string {
    return this.metricOptions.find(m => m.key === this.selectedMetric)?.color || '#6366f1';
  }

  /// Submete o formulário de medidas.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    const payload = {
      studentId: this.studentId,
      ...this.form.getRawValue()
    };

    this.http.post<StudentMeasure>(
      `${environment.apiUrl}/StudentMeasures`,
      payload
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.showForm = false;
        this.notification.success('Medidas registradas com sucesso.');
        this.loadMeasures();
        this.form.reset({ measureDate: new Date() });
      },
      error: (err) => {
        this.isSaving = false;
        this.notification.error(
          err.error?.errors?.[0] || 'Erro ao registrar medidas.'
        );
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/students', this.studentId]);
  }
}
