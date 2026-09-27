import {
  Component,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/// Modelo de opção do select.
export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './app-select.component.html',
  styleUrl: './app-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true
    }
  ]
})
export class AppSelectComponent implements ControlValueAccessor {

  /// Label exibido acima do select.
  @Input() label = '';

  /// Placeholder quando nenhuma opção está selecionada.
  @Input() placeholder = 'Selecione';

  /// Ícone Material exibido à esquerda.
  @Input() icon = '';

  /// Lista de opções disponíveis.
  @Input() options: SelectOption[] = [];

  /// Mensagem de erro exibida abaixo do campo.
  @Input() errorMessage = '';

  /// Indica se o campo está em estado de erro.
  @Input() hasError = false;

  /// Indica se o campo está desabilitado.
  @Input() disabled = false;

  /// Emite quando uma opção é selecionada.
  @Output() optionSelected = new EventEmitter<any>();

  isOpen = false;
  value: any = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  /// Fecha o dropdown ao pressionar Escape ou Tab.
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Tab') {
      this.close();
    }
  }

  /// Fecha o dropdown ao clicar fora do componente.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-select')) {
      this.close();
    }
  }

  /// Alterna a abertura do dropdown.
  toggle(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  /// Fecha o dropdown.
  close(): void {
    this.isOpen = false;
  }

  /// Seleciona uma opção e emite o evento.
  select(option: SelectOption): void {
    if (this.disabled) return;
    this.value = option.value;
    this.onChange(option.value);
    this.onTouched();
    this.optionSelected.emit(option.value);
    this.close();
  }

  /// Retorna o label da opção atualmente selecionada.
  get selectedLabel(): string {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : '';
  }

  /// Verifica se uma opção está selecionada.
  isSelected(option: SelectOption): boolean {
    return this.value === option.value;
  }

  // ─── ControlValueAccessor ────────────────────────────────────────────────
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
