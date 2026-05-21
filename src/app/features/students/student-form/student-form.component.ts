import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
import { StudentService } from '../../../core/services/student/student.service';

@Component({
  selector: 'app-student-form',
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
    MatNativeDateModule
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  studentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    /// Inicializa o formulário com as validações necessárias.
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      cpf: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      birthDate: ['', [Validators.required]],
      address: ['', [Validators.maxLength(300)]],
      emergencyContact: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.studentId;

    if (this.isEditMode) {
      this.loadStudent();
    }
  }

  /// Carrega os dados do aluno para edição.
  private loadStudent(): void {
    this.isLoading = true;
    this.studentService.getById(this.studentId!).subscribe({
      next: (student) => {
        this.form.patchValue({
          name: student.name,
          email: student.email,
          phone: student.phone,
          birthDate: student.birthDate,
          address: student.address,
          emergencyContact: student.emergencyContact
        });

        /// Desabilita o CPF em modo de edição pois não pode ser alterado.
        this.form.get('cpf')?.disable();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar aluno.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/students']);
      }
    });
  }

  /// Salva o aluno — cria ou atualiza conforme o modo.
  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    if (this.isEditMode) {
      this.studentService.update(this.studentId!, this.form.value).subscribe({
        next: () => {
          this.snackBar.open('Aluno atualizado com sucesso.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open(
            err.error?.errors?.[0] || 'Erro ao atualizar aluno.',
            'Fechar',
            { duration: 3000 }
          );
        }
      });
    } else {
      this.studentService.create(this.form.value).subscribe({
        next: () => {
          this.snackBar.open('Aluno criado com sucesso.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open(
            err.error?.errors?.[0] || 'Erro ao criar aluno.',
            'Fechar',
            { duration: 3000 }
          );
        }
      });
    }
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/students']);
  }
}
