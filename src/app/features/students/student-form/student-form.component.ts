import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { StudentService } from '../../../core/services/student/student.service';
import {
  AppSelectComponent,
  SelectOption,
} from '../../../shared/components/app-select/app-select.component';

@Component({
  selector: 'app-student-form',
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
    MatSelectModule,
    MatCheckboxModule,
    LoadingSpinnerComponent,
    AppSelectComponent,
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  studentId: string | null = null;

  /// Opções de estado civil no formato SelectOption.
  maritalStatusOptions: SelectOption[] = [
    { value: 1, label: 'Solteiro(a)' },
    { value: 2, label: 'Casado(a)' },
    { value: 3, label: 'Divorciado(a)' },
    { value: 4, label: 'Viúvo(a)' },
    { value: 5, label: 'União Estável' },
  ];

  /// Opções de UF no formato SelectOption.
  stateOptions: SelectOption[] = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ].map((uf) => ({ value: uf, label: uf }));

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private notification: NotificationService,
  ) {
    this.form = this.fb.group({
      /// Dados pessoais obrigatórios.
      name: ['', [Validators.required, Validators.maxLength(150)]],
      cpf: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(200)],
      ],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      birthDate: ['', [Validators.required]],

      /// Dados complementares do contrato.
      identityDocument: ['', [Validators.maxLength(20)]],
      profession: ['', [Validators.maxLength(100)]],
      maritalStatus: [null],

      /// Endereço estruturado.
      street: ['', [Validators.maxLength(200)]],
      addressNumber: ['', [Validators.maxLength(20)]],
      complement: ['', [Validators.maxLength(100)]],
      district: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(2)]],
      zipCode: ['', [Validators.maxLength(9)]],

      /// Responsável legal (para menores de 18 anos).
      guardianName: ['', [Validators.maxLength(150)]],
      guardianCpf: ['', [Validators.maxLength(14)]],

      /// Contato de emergência.
      emergencyContact: ['', [Validators.maxLength(200)]],

      /// Termos e aceites.
      imageRightsAccepted: [false],
      internalRegulationAccepted: [false],
    });
  }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.studentId;

    if (this.isEditMode) {
      this.loadStudent();
    }

    /// Monitora a data de nascimento para exibir/ocultar campos do responsável.
    this.form.get('birthDate')?.valueChanges.subscribe((date) => {
      if (date) this.updateGuardianValidators(date);
    });
  }

  /// Verifica se o aluno é menor de idade.
  get isMinor(): boolean {
    const birth = this.form.get('birthDate')?.value;
    if (!birth) return false;
    const age = new Date().getFullYear() - new Date(birth).getFullYear();
    return age < 18;
  }

  /// Atualiza os validators dos campos do responsável conforme a idade.
  private updateGuardianValidators(birthDate: Date): void {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    const guardianName = this.form.get('guardianName');
    const guardianCpf = this.form.get('guardianCpf');

    if (age < 18) {
      guardianName?.setValidators([
        Validators.required,
        Validators.maxLength(150),
      ]);
      guardianCpf?.setValidators([
        Validators.required,
        Validators.maxLength(14),
      ]);
    } else {
      guardianName?.setValidators([Validators.maxLength(150)]);
      guardianCpf?.setValidators([Validators.maxLength(14)]);
    }

    guardianName?.updateValueAndValidity();
    guardianCpf?.updateValueAndValidity();
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
          identityDocument: student.identityDocument,
          profession: student.profession,
          maritalStatus: student.maritalStatus,
          street: student.street,
          addressNumber: student.addressNumber,
          complement: student.complement,
          district: student.district,
          city: student.city,
          state: student.state,
          zipCode: student.zipCode,
          guardianName: student.guardianName,
          guardianCpf: student.guardianCpf,
          emergencyContact: student.emergencyContact,
          imageRightsAccepted: student.imageRightsAccepted,
          internalRegulationAccepted: student.internalRegulationAccepted,
        });

        /// CPF não pode ser alterado em modo de edição.
        this.form.get('cpf')?.disable();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notification.error('Erro ao carregar aluno.');
        this.router.navigate(['/students']);
      },
    });
  }

  /// Aplica máscara de telefone: (00) 00000-0000.
  applyPhoneMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    input.value = v;
    this.form.get('phone')?.setValue(v, { emitEvent: false });
  }

  /// Aplica máscara de CPF: 000.000.000-00.
  applyCpfMask(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)
      v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
    else if (v.length > 6)
      v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    else if (v.length > 3) v = `${v.slice(0, 3)}.${v.slice(3)}`;
    input.value = v;
    this.form.get(field)?.setValue(v, { emitEvent: false });
  }

  /// Aplica máscara de CEP: 00000-000.
  applyCepMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    input.value = v;
    this.form.get('zipCode')?.setValue(v, { emitEvent: false });
  }

  /// Limita RG a 9 dígitos.
  applyRgMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 9);
    this.form
      .get('identityDocument')
      ?.setValue(input.value, { emitEvent: false });
  }

  /// Salva o aluno — cria ou atualiza conforme o modo.
  onSubmit(): void {
    if (this.form.invalid) return;

    const data = this.form.getRawValue();

    /// Valida se os termos foram aceitos antes de salvar.
    if (!data.imageRightsAccepted || !data.internalRegulationAccepted) {
      this.notification.warning(
        'É necessário aceitar a Cessão de Imagem e o Regulamento Interno para cadastrar o aluno.',
      );
      return;
    }

    /// Remove máscaras antes de enviar ao backend.
    const payload = {
      ...data,
      cpf: data.cpf?.replace(/\D/g, '') || '',
      phone: data.phone?.replace(/\D/g, '') || '',
      zipCode: data.zipCode?.replace(/\D/g, '') || '',
      identityDocument: data.identityDocument?.replace(/\D/g, '') || '',
      guardianCpf: data.guardianCpf?.replace(/\D/g, '') || null,
    };

    this.isSaving = true;

    if (this.isEditMode) {
      this.studentService.update(this.studentId!, payload).subscribe({
        next: () => {
          this.notification.success('Aluno atualizado com sucesso.');
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.isSaving = false;
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao atualizar aluno.',
          );
        },
      });
    } else {
      this.studentService.create(payload).subscribe({
        next: () => {
          this.notification.success('Aluno cadastrado com sucesso.');
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.isSaving = false;
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao cadastrar aluno.',
          );
        },
      });
    }
  }

  /// Cancela e volta para a listagem.
  onCancel(): void {
    this.router.navigate(['/students']);
  }
}
