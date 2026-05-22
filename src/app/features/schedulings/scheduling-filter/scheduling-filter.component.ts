import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { animate, style, transition, trigger } from '@angular/animations';
import { SchedulingStatus } from '../../../core/models/scheduling.model';

/// Modelo de filtro de agendamentos.
export interface SchedulingFilter {
  date: Date | null;
  status: SchedulingStatus | null;
}

@Component({
  selector: 'app-scheduling-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './scheduling-filter.component.html',
  styleUrl: './scheduling-filter.component.scss',
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
export class SchedulingFilterComponent implements OnInit {

  /// Emite o filtro preenchido ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<SchedulingFilter>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel está expandido ou recolhido.
  isExpanded = true;

  form!: FormGroup;

  /// Opções de status de agendamento.
  statusOptions = [
    { value: SchedulingStatus.Scheduled, label: 'Agendado' },
    { value: SchedulingStatus.Present, label: 'Presente' },
    { value: SchedulingStatus.JustifiedAbsence, label: 'Falta Justificada' },
    { value: SchedulingStatus.UnjustifiedAbsence, label: 'Falta Injustificada' },
    { value: SchedulingStatus.Cancelled, label: 'Cancelado' },
    { value: SchedulingStatus.Makeup, label: 'Reposição' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /// Inicializa o formulário com os campos do filtro de agendamentos.
    this.form = this.fb.group({
      date: [new Date()],
      status: [null]
    });
  }

  /// Alterna entre expandido e recolhido.
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /// Verifica se algum campo está preenchido.
  get hasActiveFilters(): boolean {
    const { status } = this.form.value;
    return status !== null;
  }

  /// Emite os valores do filtro ao clicar em Filtrar.
  onFilter(): void {
    this.filterApplied.emit(this.form.value);
    this.isExpanded = false;
  }

  /// Limpa todos os campos e emite o evento de limpeza.
  onClear(): void {
    this.form.reset({ date: new Date(), status: null });
    this.filterCleared.emit();
  }
}
