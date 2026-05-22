import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/// Tipos de badge disponíveis no design system.
export type BadgeType = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {

  /// Texto exibido no badge.
  @Input() label: string = '';

  /// Tipo visual do badge que define a cor.
  @Input() type: BadgeType = 'neutral';

  /// Retorna as classes CSS baseadas no tipo do badge.
  getBadgeClass(): string {
    const classes: Record<BadgeType, string> = {
      success: 'badge--success',
      danger:  'badge--danger',
      warning: 'badge--warning',
      info:    'badge--info',
      neutral: 'badge--neutral',
      primary: 'badge--primary'
    };
    return classes[this.type];
  }
}
