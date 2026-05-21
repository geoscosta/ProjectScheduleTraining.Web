import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.scss'
})
export class ScheduleFormComponent {

  form: FormGroup;
  isSaving = false;
  today = new Date();

  /// Opções de horário disponíveis para seleção.
  availableTimes = [
    '06:00:00', '07:00:00', '08:00:00', '09:00:00',
    '10:00:00', '11:00:00', '12:00:00', '13:00:00',
    '14:00:00', '15:00:00', '16:00:00', '17:00:00',
    '18:00:00', '19:00:00'
  ];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    /// Inicializa o formulário com as validações necessárias.
    this.form = this.fb.group({
      date: ['', [Validators.required]],
      startTime: ['', [Validators.required]]
    });
  }

  /// Cria um novo horário na agenda.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    const date = this.form.get('date')?.value;
    const dateStr = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;

    const request = {
      date: dateStr,
      startTime: this.form.get('startTime')?.value
    };

    this.scheduleService.create(request).subscribe({
      next: () => {
        this.snackBar.open('Horário criado com sucesso.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/schedules']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          err.error?.errors?.[0] || 'Erro ao criar horário.',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/schedules']);
  }
}
