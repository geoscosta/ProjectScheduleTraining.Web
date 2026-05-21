import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {

  /// Título do card de indicador.
  @Input() title: string = '';

  /// Valor numérico exibido em destaque.
  @Input() value: number = 0;

  /// Nome do ícone Material Icons.
  @Input() icon: string = 'info';

  /// Cor do ícone e fundo. Ex: 'blue', 'green', 'red', 'purple'.
  @Input() color: 'blue' | 'green' | 'red' | 'purple' | 'yellow' = 'blue';

  /// Rota para navegação ao clicar no card.
  @Input() routerLink: string = '';

  /// Retorna as classes CSS do container do ícone baseado na cor.
  getIconContainerClass(): string {
    const classes: Record<string, string> = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      red: 'bg-red-50',
      purple: 'bg-purple-50',
      yellow: 'bg-yellow-50'
    };
    return classes[this.color];
  }

  /// Retorna as classes CSS do ícone baseado na cor.
  getIconClass(): string {
    const classes: Record<string, string> = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-500'
    };
    return classes[this.color];
  }

  /// Retorna as classes CSS do valor baseado na cor e contexto.
  getValueClass(): string {
    if (this.color === 'red' && this.value > 0) {
      return 'text-red-600';
    }
    return 'text-slate-800';
  }
}
