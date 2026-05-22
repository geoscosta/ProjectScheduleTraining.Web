import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { animate, style, transition, trigger } from '@angular/animations';
import { StudentSummary } from '../../../core/models/student.model';

/// Modelo de filtro de matrículas.
export interface EnrollmentFilter {
  studentId: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-enrollment-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './enrollment-filter.component.html',
  styleUrl: './enrollment-filter.component.scss',
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
export class EnrollmentFilterComponent implements OnInit {

  /// Lista de alunos para o select.
  @Input() students: StudentSummary[] = [];

  /// Emite o filtro preenchido ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<EnrollmentFilter>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel está expandido ou recolhido.
  isExpanded = true;

  form!: FormGroup;

  /// Opções de status da matrícula.
  statusOptions = [
    { value: true, label: 'Ativa' },
    { value: false, label: 'Cancelada' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /// Inicializa o formulário com os campos do filtro de matrículas.
    this.form = this.fb.group({
      studentId: [''],
      isActive: [null]
    });
  }

  /// Alterna entre expandido e recolhido.
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /// Verifica se algum campo está preenchido.
  get hasActiveFilters(): boolean {
    const { studentId, isActive } = this.form.value;
    return !!studentId || isActive !== null;
  }

  /// Emite os valores do filtro ao clicar em Filtrar.
  onFilter(): void {
    this.filterApplied.emit(this.form.value);
    this.isExpanded = false;
  }

  /// Limpa todos os campos e emite o evento de limpeza.
  onClear(): void {
    this.form.reset({ studentId: '', isActive: null });
    this.filterCleared.emit();
  }
}
