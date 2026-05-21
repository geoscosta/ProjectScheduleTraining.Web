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
import { EnrollmentService } from '../../../core/services/enrollment/enrollment.service';
import { StudentService } from '../../../core/services/student/student.service';
import { PlanService } from '../../../core/services/plan/plan.service';
import { StudentSummary } from '../../../core/models/student.model';
import { PlanSummary } from '../../../core/models/plan.model';

@Component({
  selector: 'app-enrollment-form',
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
    MatSelectModule
  ],
  templateUrl: './enrollment-form.component.html',
  styleUrl: './enrollment-form.component.scss'
})
export class EnrollmentFormComponent implements OnInit {

  form: FormGroup;
  isLoading = true;
  isSaving = false;
  students: StudentSummary[] = [];
  plans: PlanSummary[] = [];

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private planService: PlanService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    /// Inicializa o formulário com as validações necessárias.
    this.form = this.fb.group({
      studentId: ['', [Validators.required]],
      planId: ['', [Validators.required]],
      paymentDueDay: ['', [Validators.required, Validators.min(1), Validators.max(28)]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  /// Carrega alunos e planos em paralelo para preencher os selects.
  private loadData(): void {
    this.isLoading = true;

    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.checkLoadingComplete();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar alunos.', 'Fechar', { duration: 3000 });
        this.checkLoadingComplete();
      }
    });

    this.planService.getAll().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.checkLoadingComplete();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar planos.', 'Fechar', { duration: 3000 });
        this.checkLoadingComplete();
      }
    });
  }

  /// Verifica se todos os dados foram carregados.
  private loadedCount = 0;
  private checkLoadingComplete(): void {
    this.loadedCount++;
    if (this.loadedCount >= 2) {
      this.isLoading = false;
    }
  }

  /// Cria uma nova matrícula no sistema.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.enrollmentService.create(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Matrícula criada com sucesso.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/enrollments']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          err.error?.errors?.[0] || 'Erro ao criar matrícula.',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/enrollments']);
  }
}
