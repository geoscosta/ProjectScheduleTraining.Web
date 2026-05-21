import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserAuthResponse, UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  @Output() toggleSidebar = new EventEmitter<void>();
  currentUser: UserAuthResponse | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }

  getRoleLabel(): string {
    const labels: Record<UserRole, string> = {
      [UserRole.Admin]: 'Administrador',
      [UserRole.Trainer]: 'Professor',
      [UserRole.Receptionist]: 'Recepção',
      [UserRole.Student]: 'Aluno'
    };
    return this.currentUser ? labels[this.currentUser.role] : '';
  }
}
