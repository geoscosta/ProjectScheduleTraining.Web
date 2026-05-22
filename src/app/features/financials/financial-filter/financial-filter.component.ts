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
import { FinancialStatus } from '../../../core/models/financial.model';

/// Modelo de filtro financeiro.
export interface FinancialFilter {
  studentName: string;
  status: FinancialStatus | null;
  dueDateStart: Date | null;
  dueDateEnd: Date | null;
}

@Component({
  selector: 'app-financial-filter',
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
  templateUrl: './financial-filter.component.html',
  styleUrl: './financial-filter.component.scss',
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
export class FinancialFilterComponent implements OnInit {

  /// Emite o filtro preenchido ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<FinancialFilter>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel está expandido ou recolhido.
  isExpanded = true;

  form!: FormGroup;

  /// Opções de status financeiro.
  statusOptions = [
    { value: FinancialStatus.Pending, label: 'Pendente' },
    { value: FinancialStatus.Paid, label: 'Pago' },
    { value: FinancialStatus.Overdue, label: 'Vencido' },
    { value: FinancialStatus.Cancelled, label: 'Cancelado' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /// Inicializa o formulário com os campos do filtro financeiro.
    this.form = this.fb.group({
      studentName: [''],
      status: [null],
      dueDateStart: [null],
      dueDateEnd: [null]
    });
  }

  /// Alterna entre expandido e recolhido.
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /// Verifica se algum campo está preenchido.
  get hasActiveFilters(): boolean {
    const { studentName, status, dueDateStart, dueDateEnd } = this.form.value;
    return !!studentName || status !== null || !!dueDateStart || !!dueDateEnd;
  }

  /// Emite os valores do filtro ao clicar em Filtrar.
  onFilter(): void {
    this.filterApplied.emit(this.form.value);
    this.isExpanded = false;
  }

  /// Limpa todos os campos e emite o evento de limpeza.
  onClear(): void {
    this.form.reset({
      studentName: '',
      status: null,
      dueDateStart: null,
      dueDateEnd: null
    });
    this.filterCleared.emit();
  }
}
