import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { StudentStatus, StudentSummary } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student/student.service';

/// Modelo de filtro de alunos.
export interface StudentFilter {
  name: string;
  email: string;
  status: StudentStatus | null;
}

@Component({
  selector: 'app-student-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  templateUrl: './student-filter.component.html',
  styleUrl: './student-filter.component.scss',
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
export class StudentFilterComponent implements OnInit, OnDestroy {

  /// Emite o filtro preenchido ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<StudentFilter>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel está expandido ou recolhido.
  isExpanded = true;

  form!: FormGroup;

  /// Lista completa de alunos para o autocomplete.
  private allStudents: StudentSummary[] = [];

  /// Sugestões filtradas para o campo nome.
  nameSuggestions: string[] = [];

  /// Sugestões filtradas para o campo e-mail.
  emailSuggestions: string[] = [];

  /// Subject para cancelar subscriptions ao destruir o componente.
  private destroy$ = new Subject<void>();

  /// Opções de status disponíveis para o select.
  statusOptions = [
    { value: StudentStatus.Active, label: 'Ativo' },
    { value: StudentStatus.Inactive, label: 'Inativo' },
    { value: StudentStatus.Blocked, label: 'Bloqueado' }
  ];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    /// Inicializa o formulário com os campos do filtro de alunos.
    this.form = this.fb.group({
      name: [''],
      email: [''],
      status: [null]
    });

    /// Carrega a lista de alunos para o autocomplete.
    this.loadStudents();

    /// Monitora o campo nome e filtra sugestões após 3 caracteres.
    this.form.get('name')!.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.nameSuggestions = this.filterNameSuggestions(value);
    });

    /// Monitora o campo e-mail e filtra sugestões após 3 caracteres.
    this.form.get('email')!.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.emailSuggestions = this.filterEmailSuggestions(value);
    });
  }

  ngOnDestroy(): void {
    /// Cancela todas as subscriptions ativas ao destruir o componente.
    this.destroy$.next();
    this.destroy$.complete();
  }

  /// Carrega todos os alunos para uso no autocomplete.
  private loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => this.allStudents = students,
      error: () => this.allStudents = []
    });
  }

  /// Filtra sugestões de nome a partir do 3º caractere digitado.
  private filterNameSuggestions(value: string): string[] {
    if (!value || value.length < 3) return [];
    const term = value.toLowerCase();
    return this.allStudents
      .map(s => s.name)
      .filter(name => name.toLowerCase().includes(term))
      .slice(0, 5);
  }

  /// Filtra sugestões de e-mail a partir do 3º caractere digitado.
  private filterEmailSuggestions(value: string): string[] {
    if (!value || value.length < 3) return [];
    const term = value.toLowerCase();
    return this.allStudents
      .map(s => s.email)
      .filter(email => email.toLowerCase().includes(term))
      .slice(0, 5);
  }

  /// Alterna entre expandido e recolhido.
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /// Verifica se algum campo está preenchido.
  get hasActiveFilters(): boolean {
    const { name, email, status } = this.form.value;
    return !!name || !!email || status !== null;
  }

  /// Emite os valores do filtro ao clicar em Filtrar.
  onFilter(): void {
    this.filterApplied.emit(this.form.value);
    this.isExpanded = false;
  }

  /// Limpa todos os campos e emite o evento de limpeza.
  onClear(): void {
    this.form.reset({ name: '', email: '', status: null });
    this.nameSuggestions = [];
    this.emailSuggestions = [];
    this.filterCleared.emit();
  }
}
