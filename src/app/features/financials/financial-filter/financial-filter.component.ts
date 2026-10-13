import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FinancialStatus } from '../../../core/models/financial.model';
import { StudentSummary } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student/student.service';

/// Modelo de filtro financeiro.
export interface FinancialFilter {
  studentId: string | null;
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
    MatAutocompleteModule
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
export class FinancialFilterComponent implements OnInit, OnDestroy {

  @Output() filterApplied = new EventEmitter<FinancialFilter>();
  @Output() filterCleared = new EventEmitter<void>();

  isExpanded = true;
  form!: FormGroup;

  /// Lista de alunos para o autocomplete.
  private allStudents: StudentSummary[] = [];
  studentSuggestions: StudentSummary[] = [];
  selectedStudentId: string | null = null;

  private destroy$ = new Subject<void>();

  statusOptions = [
    { value: FinancialStatus.Pending,   label: 'Pendente' },
    { value: FinancialStatus.Paid,      label: 'Pago' },
    { value: FinancialStatus.Overdue,   label: 'Vencido' },
    { value: FinancialStatus.Cancelled, label: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      studentName:  [''],
      status:       [null],
      dueDateStart: [null],
      dueDateEnd:   [null]
    });

    /// Carrega alunos para o autocomplete.
    this.studentService.getAll().subscribe({
      next: (students) => this.allStudents = students,
      error: () => this.allStudents = []
    });

    /// Filtra sugestões a partir do 3º caractere.
    this.form.get('studentName')!.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      /// Se o valor mudou manualmente, limpa o studentId selecionado.
      if (value !== this.getSelectedStudentName()) {
        this.selectedStudentId = null;
      }

      if (value && value.length >= 3) {
        const term = value.toLowerCase();
        this.studentSuggestions = this.allStudents
          .filter(s => s.name.toLowerCase().includes(term))
          .slice(0, 5);
      } else {
        this.studentSuggestions = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /// Retorna o nome do aluno selecionado.
  private getSelectedStudentName(): string {
    if (!this.selectedStudentId) return '';
    return this.allStudents.find(s => s.id === this.selectedStudentId)?.name || '';
  }

  /// Seleciona um aluno do autocomplete.
  onSelectStudent(student: StudentSummary): void {
    this.selectedStudentId = student.id;
    this.form.get('studentName')?.setValue(student.name, { emitEvent: false });
    this.studentSuggestions = [];
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  get hasActiveFilters(): boolean {
    const { studentName, status, dueDateStart, dueDateEnd } = this.form.value;
    return !!studentName || status !== null || !!dueDateStart || !!dueDateEnd;
  }

  onFilter(): void {
    this.filterApplied.emit({
      studentId:    this.selectedStudentId,
      status:       this.form.get('status')?.value,
      dueDateStart: this.form.get('dueDateStart')?.value,
      dueDateEnd:   this.form.get('dueDateEnd')?.value
    });
    this.isExpanded = false;
  }

  onClear(): void {
    this.form.reset({ studentName: '', status: null, dueDateStart: null, dueDateEnd: null });
    this.selectedStudentId = null;
    this.studentSuggestions = [];
    this.filterCleared.emit();
  }
}
