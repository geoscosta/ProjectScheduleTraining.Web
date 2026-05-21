import { Component, OnInit } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { SchedulingService } from '../../../core/services/scheduling/scheduling.service';
import { StudentService } from '../../../core/services/student/student.service';
import { ScheduleService } from '../../../core/services/schedule/schedule.service';
import { StudentSummary } from '../../../core/models/student.model';
import { ScheduleSummary } from '../../../core/models/schedule.model';

@Component({
  selector: 'app-scheduling-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './scheduling-form.component.html',
  styleUrl: './scheduling-form.component.scss'
})
export class SchedulingFormComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  students: StudentSummary[] = [];
  schedules: ScheduleSummary[] = [];
  selectedDate: Date = new Date();
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private studentService: StudentService,
    private scheduleService: ScheduleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    /// Inicializa o formulário com as validações necessárias.
    this.form = this.fb.group({
      studentId: ['', [Validators.required]],
      scheduleId: ['', [Validators.required]],
      isMakeup: [false]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadSchedulesByDate();
  }

  /// Carrega a lista de alunos ativos.
  private loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => this.students = students,
      error: () => this.snackBar.open('Erro ao carregar alunos.', 'Fechar', { duration: 3000 })
    });
  }

  /// Carrega os horários disponíveis da data selecionada.
  loadSchedulesByDate(): void {
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.scheduleService.getByDate(dateStr).subscribe({
      next: (schedules) => {
        this.schedules = schedules.filter(s => s.availableSlots > 0);
        this.form.get('scheduleId')?.reset();
      },
      error: () => this.schedules = []
    });
  }

  /// Atualiza a data e recarrega os horários disponíveis.
  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadSchedulesByDate();
  }

  /// Cria um novo agendamento no sistema.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.schedulingService.create(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Agendamento criado com sucesso.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/schedulings']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          err.error?.errors?.[0] || 'Erro ao criar agendamento.',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/schedulings']);
  }
}
