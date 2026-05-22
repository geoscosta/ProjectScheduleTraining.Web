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
import { ScheduleStatus } from '../../../core/models/schedule.model';

/// Modelo de filtro de horários.
export interface ScheduleFilter {
  date: Date | null;
  status: ScheduleStatus | null;
}

@Component({
  selector: 'app-schedule-filter',
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
  templateUrl: './schedule-filter.component.html',
  styleUrl: './schedule-filter.component.scss',
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
export class ScheduleFilterComponent implements OnInit {

  /// Emite o filtro preenchido ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<ScheduleFilter>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel está expandido ou recolhido.
  isExpanded = true;

  form!: FormGroup;

  /// Opções de status de horário.
  statusOptions = [
    { value: ScheduleStatus.Available, label: 'Disponível' },
    { value: ScheduleStatus.Full, label: 'Lotada' },
    { value: ScheduleStatus.Blocked, label: 'Bloqueada' },
    { value: ScheduleStatus.Cancelled, label: 'Cancelada' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /// Inicializa o formulário com os campos do filtro de horários.
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
