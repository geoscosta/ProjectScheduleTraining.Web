import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { animate, style, transition, trigger } from '@angular/animations';

/// Definição de um campo do filtro.
export interface FilterField {
  /// Chave do campo no FormGroup.
  key: string;
  /// Label exibido no campo.
  label: string;
  /// Tipo do campo: texto, select ou date.
  type: 'text' | 'select' | 'date';
  /// Placeholder do campo (para tipo text).
  placeholder?: string;
  /// Opções do select (para tipo select).
  options?: { value: any; label: string }[];
  /// Indica se o select permite múltipla seleção.
  multiple?: boolean;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
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
export class SearchFilterComponent implements OnInit {

  /// Lista de campos a serem exibidos no filtro.
  @Input() fields: FilterField[] = [];

  /// Emite os valores do filtro ao clicar em Filtrar.
  @Output() filterApplied = new EventEmitter<Record<string, any>>();

  /// Emite evento ao clicar em Limpar.
  @Output() filterCleared = new EventEmitter<void>();

  /// Controla se o painel de filtro está expandido ou recolhido.
  isExpanded = true;

  /// FormGroup dinâmico gerado a partir dos fields.
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  /// Constrói o FormGroup dinamicamente baseado nos fields recebidos.
  private buildForm(): void {
    const controls: Record<string, any> = {};
    this.fields.forEach(field => {
      controls[field.key] = [field.multiple ? [] : ''];
    });
    this.form = this.fb.group(controls);
  }

  /// Alterna entre expandido e recolhido.
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  /// Emite os valores preenchidos no formulário.
  onFilter(): void {
    this.filterApplied.emit(this.form.value);
  }

  /// Limpa todos os campos e emite o evento de limpeza.
  onClear(): void {
    this.form.reset();
    this.fields.forEach(field => {
      if (field.multiple) {
        this.form.get(field.key)?.setValue([]);
      }
    });
    this.filterCleared.emit();
  }

  /// Verifica se algum campo do filtro está preenchido.
  hasActiveFilters(): boolean {
    return Object.values(this.form.value).some(v =>
      v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
    );
  }
}
