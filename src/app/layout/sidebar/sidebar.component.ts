import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserRole } from '../../core/models/auth.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  /// Controla a visibilidade do sidebar.
  @Input() isOpen = true;

  /// Define os itens do menu com suas rotas e perfis permitidos.
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: [UserRole.Admin, UserRole.Trainer, UserRole.Receptionist, UserRole.Student]
    },
    {
      label: 'Alunos',
      icon: 'people',
      route: '/students',
      roles: [UserRole.Admin, UserRole.Receptionist]
    },
    {
      label: 'Planos',
      icon: 'assignment',
      route: '/plans',
      roles: [UserRole.Admin, UserRole.Receptionist]
    },
    {
      label: 'Matrículas',
      icon: 'card_membership',
      route: '/enrollments',
      roles: [UserRole.Admin, UserRole.Receptionist]
    },
    {
      label: 'Agenda',
      icon: 'calendar_today',
      route: '/schedules',
      roles: [UserRole.Admin, UserRole.Trainer, UserRole.Receptionist]
    },
    {
      label: 'Agendamentos',
      icon: 'event_available',
      route: '/schedulings',
      roles: [UserRole.Admin, UserRole.Trainer, UserRole.Receptionist]
    },
    {
      label: 'Financeiro',
      icon: 'attach_money',
      route: '/financials',
      roles: [UserRole.Admin, UserRole.Receptionist]
    }
  ];

  constructor(private authService: AuthService) {}

  /// Verifica se o item do menu deve ser exibido para o perfil atual.
  canShow(item: MenuItem): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return item.roles.includes(user.role);
  }
}
