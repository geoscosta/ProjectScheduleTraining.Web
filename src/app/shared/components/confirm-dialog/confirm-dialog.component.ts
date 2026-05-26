import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/// Dados recebidos pelo dialog de confirmação.
export interface ConfirmDialogData {
  /// Título do dialog.
  title: string;
  /// Mensagem de confirmação.
  message: string;
  /// Texto do botão de confirmação.
  confirmLabel?: string;
  /// Texto do botão de cancelamento.
  cancelLabel?: string;
  /// Tipo visual do dialog.
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  /// Retorna o ícone baseado no tipo do dialog.
  getIcon(): string {
    const icons: Record<string, string> = {
      danger: 'delete_forever',
      warning: 'warning_amber',
      info: 'info'
    };
    return icons[this.data.type || 'warning'];
  }

  /// Retorna as classes CSS do ícone baseado no tipo.
  getIconClass(): string {
    const classes: Record<string, string> = {
      danger: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500'
    };
    return classes[this.data.type || 'warning'];
  }

  /// Retorna as classes CSS do container do ícone.
  getIconContainerClass(): string {
    const classes: Record<string, string> = {
      danger: 'bg-red-50',
      warning: 'bg-yellow-50',
      info: 'bg-blue-50'
    };
    return classes[this.data.type || 'warning'];
  }

  /// Retorna as classes CSS do botão de confirmação.
  getConfirmButtonColor(): string {
    return this.data.type === 'danger' ? 'warn' : 'primary';
  }

  /// Confirma a ação e fecha o dialog.
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /// Cancela a ação e fecha o dialog.
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
