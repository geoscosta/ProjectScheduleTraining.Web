import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {

  /// Ícone Material Icons exibido no centro.
  @Input() icon: string = 'inbox';

  /// Mensagem principal exibida abaixo do ícone.
  @Input() message: string = 'Nenhum item encontrado.';

  /// Texto do botão de ação (opcional).
  @Input() actionLabel: string = '';

  /// Rota para o botão de ação (opcional).
  @Input() actionRoute: string = '';
}
