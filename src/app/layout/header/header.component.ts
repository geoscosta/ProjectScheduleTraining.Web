import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserAuthResponse } from '../../core/models/auth.model';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  /// Emite evento para alternar o sidebar.
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: UserAuthResponse | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  /// Emite o evento de toggle do sidebar.
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /// Realiza o logout do usuário.
  onLogout(): void {
    this.authService.logout();
  }

  /// Navega para o perfil do usuário.
  onProfile(): void {
    this.router.navigate(['/profile']);
  }
}
