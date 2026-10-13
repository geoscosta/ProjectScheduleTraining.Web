import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AppSelectComponent, SelectOption } from '../../../shared/components/app-select/app-select.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AppSelectComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.scss'
})
export class ScheduleFormComponent {

  form: FormGroup;
  isSaving = false;
  today = new Date();

  /// Opções de horário disponíveis conforme horário de funcionamento do estúdio.
  /// Segunda a Sexta: 06h-12h e 15h-21h.
  timeOptions: SelectOption[] = [
    { value: '06:00:00', label: '06:00' },
    { value: '07:00:00', label: '07:00' },
    { value: '08:00:00', label: '08:00' },
    { value: '09:00:00', label: '09:00' },
    { value: '10:00:00', label: '10:00' },
    { value: '11:00:00', label: '11:00' },
    { value: '15:00:00', label: '15:00' },
    { value: '16:00:00', label: '16:00' },
    { value: '17:00:00', label: '17:00' },
    { value: '18:00:00', label: '18:00' },
    { value: '19:00:00', label: '19:00' },
    { value: '20:00:00', label: '20:00' },
  ];

  /// Opções de tipo de sessão com capacidade máxima por turma.
  sessionTypeOptions: SelectOption[] = [
    { value: 1, label: 'Pilates — máx. 3 alunos' },
    { value: 2, label: 'Semi Personalizado — máx. 4 alunos' },
    { value: 3, label: 'Individualizado — máx. 1 aluno' }
  ];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private router: Router,
    private notification: NotificationService
  ) {
    this.form = this.fb.group({
      date:        ['', [Validators.required]],
      startTime:   ['', [Validators.required]],
      sessionType: ['', [Validators.required]]
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
      date:        dateStr,
      startTime:   this.form.get('startTime')?.value,
      sessionType: this.form.get('sessionType')?.value
    };

    this.scheduleService.create(request).subscribe({
      next: () => {
        this.notification.success('Horário criado com sucesso.');
        this.router.navigate(['/schedules']);
      },
      error: (err) => {
        this.isSaving = false;
        this.notification.error(
          err.error?.errors?.[0] || 'Erro ao criar horário.'
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/schedules']);
  }
}
