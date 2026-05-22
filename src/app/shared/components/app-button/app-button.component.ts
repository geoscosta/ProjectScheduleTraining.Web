import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

/// Variantes visuais do botão.
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/// Tamanhos disponíveis do botão.
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './app-button.component.html',
  styleUrl: './app-button.component.scss'
})
export class AppButtonComponent {

  /// Texto exibido no botão.
  @Input() label: string = '';

  /// Variante visual do botão.
  @Input() variant: ButtonVariant = 'primary';

  /// Tamanho do botão.
  @Input() size: ButtonSize = 'md';

  /// Ícone Material Icons exibido à esquerda do label.
  @Input() icon: string = '';

  /// Indica se o botão está em estado de carregamento.
  @Input() loading: boolean = false;

  /// Indica se o botão está desabilitado.
  @Input() disabled: boolean = false;

  /// Indica se o botão deve ocupar 100% da largura.
  @Input() fullWidth: boolean = false;

  /// Tipo HTML do botão.
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /// Emite evento ao clicar no botão.
  @Output() clickFunc = new EventEmitter<void>();

  /// Retorna as classes CSS do botão baseadas nas propriedades.
  getButtonClass(): string {
    const classes = [
      'btn',
      `btn--${this.variant}`,
      `btn--${this.size}`,
      this.fullWidth ? 'btn--full' : '',
      this.loading ? 'btn--loading' : '',
      this.disabled || this.loading ? 'btn--disabled' : ''
    ];
    return classes.filter(Boolean).join(' ');
  }

  /// Processa o clique verificando se o botão está habilitado.
  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clickFunc.emit();
    }
  }
}
