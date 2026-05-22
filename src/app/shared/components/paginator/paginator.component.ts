import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent implements OnChanges {

  /// Página atual (começa em 1).
  @Input() page: number = 1;

  /// Total de páginas disponíveis.
  @Input() totalPages: number = 1;

  /// Quantidade de itens exibidos na página atual.
  @Input() elementsShowing: number = 0;

  /// Total de itens em todas as páginas.
  @Input() totalElements: number = 0;

  /// Emite o número da página selecionada ao clicar.
  @Output() pageChanged = new EventEmitter<number>();

  /// Índices intermediários exibidos entre a primeira e última página.
  middleIndexes: number[] = [];

  /// Quantidade máxima de índices intermediários exibidos.
  readonly maxMiddleIndexes = 3;

  ngOnChanges(): void {
    this.updateMiddleIndexes();
  }

  /// Atualiza os índices intermediários baseado na página atual e total de páginas.
  private updateMiddleIndexes(): void {
    const allMiddle = Array.from(
      { length: Math.max(0, this.totalPages - 2) },
      (_, i) => i + 2
    );

    if (allMiddle.length <= this.maxMiddleIndexes) {
      this.middleIndexes = allMiddle;
      return;
    }

    const position = allMiddle.findIndex(x => x === this.page);

    if (position <= 0) {
      this.middleIndexes = allMiddle.slice(0, this.maxMiddleIndexes);
    } else if (position >= allMiddle.length - 1) {
      this.middleIndexes = allMiddle.slice(-this.maxMiddleIndexes);
    } else {
      this.middleIndexes = allMiddle.slice(position - 1, position + 2);
    }
  }

  /// Navega para a página informada se for diferente da atual.
  setPage(page: number): void {
    if (page === this.page || page < 1 || page > this.totalPages) return;
    this.page = page;
    this.updateMiddleIndexes();
    this.pageChanged.emit(page);
  }

  /// Verifica se deve exibir reticências no início da paginação.
  get showStartDots(): boolean {
    return this.totalPages > this.maxMiddleIndexes + 2 &&
      this.page > this.maxMiddleIndexes;
  }

  /// Verifica se deve exibir reticências no final da paginação.
  get showEndDots(): boolean {
    return this.totalPages > this.maxMiddleIndexes + 2 &&
      this.page < this.totalPages - (this.maxMiddleIndexes - 2);
  }
}
