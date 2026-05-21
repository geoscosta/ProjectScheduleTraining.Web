import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnDestroy {

  /// Controla a visibilidade do sidebar.
  isSidebarOpen = true;

  /// Indica se a tela atual é mobile.
  isMobile = false;

  private subscription: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) {
    /// Observa mudanças no tamanho da tela.
    /// No mobile o sidebar inicia fechado e fica por cima do conteúdo.
    /// No desktop o sidebar inicia aberto e ocupa espaço no layout.
    this.subscription = this.breakpointObserver
      .observe(['(max-width: 1023px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.isSidebarOpen = !result.matches;
      });
  }

  /// Alterna a visibilidade do sidebar.
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /// Cancela a subscription ao destruir o componente para evitar memory leaks.
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
