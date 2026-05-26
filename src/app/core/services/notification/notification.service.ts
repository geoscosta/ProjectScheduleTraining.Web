import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  /// Exibe mensagem de sucesso via snackbar.
  success(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: 'snack-success',
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /// Exibe mensagem de erro via snackbar.
  error(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: 'snack-error',
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /// Exibe mensagem de alerta via snackbar.
  warning(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      panelClass: 'snack-warning',
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /// Exibe mensagem informativa via snackbar.
  info(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: 'snack-info',
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /// Exibe dialog de confirmação antes de executar ação destrutiva.
  /// Retorna Observable<boolean> — true se confirmado, false se cancelado.
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '380px',
      disableClose: true,
      panelClass: 'confirm-dialog'
    });

    return dialogRef.afterClosed();
  }
}
