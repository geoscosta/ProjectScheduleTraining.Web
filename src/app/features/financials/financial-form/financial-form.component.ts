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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FinancialService } from '../../../core/services/financial/financial.service';
import { StudentService } from '../../../core/services/student/student.service';
import { StudentSummary } from '../../../core/models/student.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-financial-form',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './financial-form.component.html',
  styleUrl: './financial-form.component.scss'
})
export class FinancialFormComponent implements OnInit {

  form: FormGroup;
  isLoading = true;
  isSaving = false;
  students: StudentSummary[] = [];
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService,
    private studentService: StudentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    /// Inicializa o formulário com as validações necessárias.
    this.form = this.fb.group({
      studentId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  /// Carrega a lista de alunos para o select.
  private loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar alunos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Cria uma nova cobrança financeira no sistema.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    const dueDate = this.form.get('dueDate')?.value;
    const dueDateStr = dueDate instanceof Date
      ? dueDate.toISOString().split('T')[0]
      : dueDate;

    const request = {
      studentId: this.form.get('studentId')?.value,
      amount: this.form.get('amount')?.value,
      dueDate: dueDateStr,
      description: this.form.get('description')?.value
    };

    this.financialService.create(request).subscribe({
      next: () => {
        this.snackBar.open('Cobrança criada com sucesso.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/financials']);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          err.error?.errors?.[0] || 'Erro ao criar cobrança.',
          'Fechar',
          { duration: 3000 }
        );
      }
    });
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/financials']);
  }
}
