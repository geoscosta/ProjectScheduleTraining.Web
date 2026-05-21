import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserAuthResponse, UserRole } from '../../core/models/auth.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  currentUser: UserAuthResponse | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard',
      roles: [UserRole.Admin, UserRole.Trainer, UserRole.Receptionist, UserRole.Student] },
    { label: 'Alunos', icon: 'people_alt', route: '/students',
      roles: [UserRole.Admin, UserRole.Receptionist] },
    { label: 'Planos', icon: 'card_membership', route: '/plans',
      roles: [UserRole.Admin, UserRole.Receptionist] },
    { label: 'Matrículas', icon: 'assignment_turned_in', route: '/enrollments',
      roles: [UserRole.Admin, UserRole.Receptionist] },
    { label: 'Agenda', icon: 'calendar_month', route: '/schedules',
      roles: [UserRole.Admin, UserRole.Trainer, UserRole.Receptionist] },
    { label: 'Agendamentos', icon: 'event_available', route: '/schedulings',
      roles: [UserRole.Admin, UserRole.Trainer, UserRole.Receptionist] },
    { label: 'Financeiro', icon: 'payments', route: '/financials',
      roles: [UserRole.Admin, UserRole.Receptionist] }
  ];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  canShow(item: MenuItem): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return item.roles.includes(user.role);
  }
}
