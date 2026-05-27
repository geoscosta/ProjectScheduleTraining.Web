import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { UserAuthResponse, UserRole } from '../../../core/models/auth.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { BadgeComponent, BadgeType } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    BadgeComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  currentUser: UserAuthResponse | null = null;
  passwordForm: FormGroup;
  isSaving = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService
  ) {
    /// Inicializa o formulário de alteração de senha.
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    /// Carrega o usuário autenticado atual.
    this.currentUser = this.authService.getCurrentUser();
  }

  /// Validador customizado que verifica se nova senha e confirmação são iguais.
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /// Retorna o label do perfil do usuário.
  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.Admin]: 'Administrador',
      [UserRole.Trainer]: 'Professor',
      [UserRole.Receptionist]: 'Recepcionista',
      [UserRole.Student]: 'Aluno'
    };
    return labels[role];
  }

  /// Retorna o tipo do badge do perfil do usuário.
  getRoleBadgeType(role: UserRole): BadgeType {
    const types: Record<UserRole, BadgeType> = {
      [UserRole.Admin]: 'primary',
      [UserRole.Trainer]: 'success',
      [UserRole.Receptionist]: 'info',
      [UserRole.Student]: 'neutral'
    };
    return types[role];
  }

  /// Retorna as iniciais do nome do usuário para o avatar.
  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n.charAt(0).toUpperCase())
      .join('');
  }

  /// Realiza logout do sistema com confirmação.
  onLogout(): void {
    this.notification.confirm({
      title: 'Sair do sistema',
      message: 'Tem certeza que deseja sair?',
      confirmLabel: 'Sair',
      cancelLabel: 'Cancelar',
      type: 'warning'
    }).subscribe(confirmed => {
      if (confirmed) this.authService.logout();
    });
  }
}
