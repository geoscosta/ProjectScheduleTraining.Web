import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { StudentService } from '../../../core/services/student/student.service';
import { StudentSummary, StudentStatus } from '../../../core/models/student.model';
import { PlanType } from '../../../core/models/plan.model';
import { Enrollment } from '../../../core/models/enrollment.model';

/// Dados recebidos pelo dialog de cancelamento.
export interface CancelEnrollmentDialogData {
  enrollment: Enrollment;
  studentName: string;
}

/// Resultado retornado pelo dialog ao confirmar.
export interface CancelEnrollmentDialogResult {
  cancellationOption: number | null;
  substituteStudentId: string | null;
}

@Component({
  selector: 'app-cancel-enrollment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  templateUrl: './cancel-enrollment-dialog.component.html',
  styleUrl: './cancel-enrollment-dialog.component.scss'
})
export class CancelEnrollmentDialogComponent implements OnInit {

  form: FormGroup;

  /// Tipos de plano com fidelidade que possuem regras especiais.
  private loyaltyPlanTypes = [PlanType.Quarterly, PlanType.SemiAnnual, PlanType.Annual];

  /// Indica se o plano é de fidelidade.
  get isLoyaltyPlan(): boolean {
    return this.loyaltyPlanTypes.includes(this.data.enrollment.plan?.type as PlanType);
  }

  /// Indica se a opção selecionada é indicar substituto.
  get isSubstituteOption(): boolean {
    return this.form.get('cancellationOption')?.value === 2;
  }

  /// Sugestões de alunos para o campo de substituto.
  studentSuggestions: StudentSummary[] = [];
  private allStudents: StudentSummary[] = [];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    public dialogRef: MatDialogRef<CancelEnrollmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancelEnrollmentDialogData
  ) {
    this.form = this.fb.group({
      cancellationOption: [null],
      substituteStudentName: [''],
      substituteStudentId: [null]
    });
  }

  ngOnInit(): void {
    /// Carrega alunos para o autocomplete de substituto.
    this.studentService.getAll().subscribe({
      next: (students) => {
        /// Exibe apenas alunos ativos e que não sejam o aluno atual.
        this.allStudents = students.filter(s =>
          s.status === StudentStatus.Active &&
          s.id !== this.data.enrollment.studentId);
      }
    });

    /// Monitora o campo de nome do substituto para filtrar sugestões.
    this.form.get('substituteStudentName')?.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && value.length >= 3) {
        const term = value.toLowerCase();
        this.studentSuggestions = this.allStudents
          .filter(s => s.name.toLowerCase().includes(term))
          .slice(0, 5);
      } else {
        this.studentSuggestions = [];
      }
    });

    /// Define obrigatoriedade conforme opção de cancelamento.
    this.form.get('cancellationOption')?.valueChanges.subscribe(option => {
      const substituteIdCtrl = this.form.get('substituteStudentId');
      if (option === 2) {
        substituteIdCtrl?.setValidators([Validators.required]);
      } else {
        substituteIdCtrl?.clearValidators();
        this.form.get('substituteStudentName')?.setValue('');
        substituteIdCtrl?.setValue(null);
      }
      substituteIdCtrl?.updateValueAndValidity();
    });
  }

  /// Seleciona um aluno substituto do autocomplete.
  onSelectSubstitute(student: StudentSummary): void {
    this.form.get('substituteStudentId')?.setValue(student.id);
    this.form.get('substituteStudentName')?.setValue(student.name);
    this.studentSuggestions = [];
  }

  /// Confirma o cancelamento e retorna o resultado.
  onConfirm(): void {
    if (this.isLoyaltyPlan && this.form.invalid) return;

    const result: CancelEnrollmentDialogResult = {
      cancellationOption: this.isLoyaltyPlan
        ? this.form.get('cancellationOption')?.value
        : null,
      substituteStudentId: this.form.get('substituteStudentId')?.value || null
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
