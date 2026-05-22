import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { animate, style, transition, trigger } from '@angular/animations';
import { PlanType, WeeklyFrequency } from '../../../core/models/plan.model';

/// Modelo de filtro de planos.
export interface PlanFilter {
  name: string;
  type: PlanType | null;
  weeklyFrequency: WeeklyFrequency | null;
}

@Component({
  selector: 'app-plan-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './plan-filter.component.html',
  styleUrl: './plan-filter.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class PlanFilterComponent implements OnInit {

  /// Emite o filtro preenchido ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<PlanFilter>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel está expandido ou recolhido.
  isExpanded = true;

  form!: FormGroup;

  /// Opções de tipo de plano para o select.
  planTypeOptions = [
    { value: PlanType.Monthly, label: 'Mensal' },
    { value: PlanType.Quarterly, label: 'Trimestral' },
    { value: PlanType.SemiAnnual, label: 'Semestral' },
    { value: PlanType.Annual, label: 'Anual' },
    { value: PlanType.ComboStrengthPilates, label: 'Combo' },
    { value: PlanType.Family, label: 'Família' }
  ];

  /// Opções de frequência semanal para o select.
  frequencyOptions = [
    { value: WeeklyFrequency.TwiceAWeek, label: '2x por semana' },
    { value: WeeklyFrequency.ThreeTimesAWeek, label: '3x por semana' },
    { value: WeeklyFrequency.FiveTimesAWeek, label: '5x por semana' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /// Inicializa o formulário com os campos do filtro de planos.
    this.form = this.fb.group({
      name: [''],
      type: [null],
      weeklyFrequency: [null]
    });
  }

  /// Alterna entre expandido e recolhido.
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /// Verifica se algum campo está preenchido.
  get hasActiveFilters(): boolean {
    const { name, type, weeklyFrequency } = this.form.value;
    return !!name || type !== null || weeklyFrequency !== null;
  }

  /// Emite os valores do filtro ao clicar em Filtrar.
  onFilter(): void {
    this.filterApplied.emit(this.form.value);
    this.isExpanded = false;
  }

  /// Limpa todos os campos e emite o evento de limpeza.
  onClear(): void {
    this.form.reset({ name: '', type: null, weeklyFrequency: null });
    this.filterCleared.emit();
  }
}
