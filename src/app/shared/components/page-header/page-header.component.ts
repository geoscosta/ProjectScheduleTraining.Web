import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {

  /// Título principal da página.
  @Input() title: string = '';

  /// Subtítulo ou descrição da página. Aceita null para quando não há subtítulo.
  @Input() subtitle: string | null = '';
}
