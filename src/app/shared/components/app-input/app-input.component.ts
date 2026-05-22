import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './app-input.component.html',
  styleUrl: './app-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true
    }
  ]
})
export class AppInputComponent implements ControlValueAccessor {

  /// Label exibido acima do input.
  @Input() label: string = '';

  /// Placeholder do input.
  @Input() placeholder: string = '';

  /// Tipo do input HTML.
  @Input() type: string = 'text';

  /// Ícone Material Icons exibido à esquerda.
  @Input() icon: string = '';

  /// Indica se o campo é obrigatório.
  @Input() required: boolean = false;

  /// Indica se o campo está desabilitado.
  @Input() disabled: boolean = false;

  /// Mensagem de erro exibida abaixo do input.
  @Input() errorMessage: string = '';

  /// FormControl para integração com Reactive Forms.
  @Input() control: FormControl = new FormControl('');

  /// Valor interno do input.
  value: string = '';

  /// Indica se o campo está com foco.
  isFocused: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /// Verifica se deve exibir o estado de erro.
  get hasError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }

  /// Escreve o valor vindo do FormControl para o input.
  writeValue(value: string): void {
    this.value = value || '';
  }

  /// Registra a função de onChange do ControlValueAccessor.
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /// Registra a função de onTouched do ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /// Atualiza o estado disabled do input.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /// Processa a mudança de valor do input.
  handleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.control.setValue(value);
  }

  /// Marca o campo como tocado ao perder o foco.
  handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  /// Marca o campo com foco ao receber foco.
  handleFocus(): void {
    this.isFocused = true;
  }
}
