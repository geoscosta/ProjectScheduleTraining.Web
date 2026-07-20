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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

/// Modelo de resposta da avaliação PAR-Q.
interface ParQResponse {
  id: string;
  studentId: string;
  assessmentDate: string;
  question1: boolean;
  question2: boolean;
  question3: boolean;
  question4: boolean;
  question5: boolean;
  question6: boolean;
  question7: boolean;
  isCleared: boolean;
  notes: string | null;
  [key: string]: boolean | string | null;
}

/// Definição das perguntas do PAR-Q.
interface ParQQuestion {
  key: string;
  text: string;
}

@Component({
  selector: 'app-student-parq',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    BadgeComponent,
  ],
  templateUrl: './student-parq.component.html',
  styleUrl: './student-parq.component.scss',
})
export class StudentParqComponent implements OnInit {
  studentId: string = '';
  isLoading = true;
  isSaving = false;
  existingAssessment: ParQResponse | null = null;
  form!: FormGroup;

  /// As 7 perguntas oficiais do PAR-Q em português.
  questions: ParQQuestion[] = [
    {
      key: 'question1',
      text: 'Algum médico já disse que você possui algum problema de coração e que só deveria realizar atividade física supervisionado por profissionais de saúde?',
    },
    {
      key: 'question2',
      text: 'Você sente dores no peito quando pratica atividade física?',
    },
    {
      key: 'question3',
      text: 'No último mês, você sentiu dores no peito quando praticou atividade física?',
    },
    {
      key: 'question4',
      text: 'Você perdeu o equilíbrio devido à tontura ou alguma vez perdeu a consciência?',
    },
    {
      key: 'question5',
      text: 'Você tem algum problema ósseo ou articular (como coluna, joelho ou quadril) que poderia piorar com a prática de atividade física?',
    },
    {
      key: 'question6',
      text: 'Algum médico já lhe receitou medicamentos para pressão arterial ou problema de coração?',
    },
    {
      key: 'question7',
      text: 'Você tem conhecimento de alguma outra razão pela qual não deveria praticar atividade física?',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    this.buildForm();
    this.loadExistingAssessment();
  }

  /// Constrói o formulário com as 7 questões do PAR-Q.
  private buildForm(): void {
    this.form = this.fb.group({
      question1: [null, Validators.required],
      question2: [null, Validators.required],
      question3: [null, Validators.required],
      question4: [null, Validators.required],
      question5: [null, Validators.required],
      question6: [null, Validators.required],
      question7: [null, Validators.required],
      notes: [''],
    });
  }

  /// Carrega a avaliação PAR-Q existente do aluno se houver.
  private loadExistingAssessment(): void {
    this.http
      .get<ParQResponse>(
        `${environment.apiUrl}/ParQAssessments/student/${this.studentId}/latest`,
      )
      .subscribe({
        next: (assessment) => {
          this.existingAssessment = assessment;
          this.isLoading = false;
        },
        error: () => {
          this.existingAssessment = null;
          this.isLoading = false;
        },
      });
  }

  /// Verifica se alguma resposta é positiva — indica risco.
  get hasRisk(): boolean {
    const values = this.form.value;
    return (
      values.question1 === true ||
      values.question2 === true ||
      values.question3 === true ||
      values.question4 === true ||
      values.question5 === true ||
      values.question6 === true ||
      values.question7 === true
    );
  }

  /// Define a resposta de uma questão.
  setAnswer(question: string, value: boolean): void {
    this.form.get(question)?.setValue(value);
    this.form.get(question)?.markAsTouched();
  }

  /// Verifica se uma resposta foi selecionada.
  getAnswer(question: string): boolean | null {
    return this.form.get(question)?.value;
  }

  /// Verifica se o formulário está completamente preenchido.
  get allAnswered(): boolean {
    return this.questions.every((q) => this.form.get(q.key)?.value !== null);
  }

  /// Retorna o número de questões ainda não respondidas.
  get unansweredCount(): number {
    return this.questions.filter((q) => this.form.get(q.key)?.value === null)
      .length;
  }
  /// Submete a avaliação PAR-Q.
  onSubmit(): void {
    if (!this.allAnswered) {
      this.notification.warning(
        'Responda todas as perguntas antes de continuar.',
      );
      return;
    }

    this.isSaving = true;

    const payload = {
      studentId: this.studentId,
      ...this.form.value,
    };

    this.http
      .post<ParQResponse>(`${environment.apiUrl}/ParQAssessments`, payload)
      .subscribe({
        next: (result) => {
          this.isSaving = false;
          this.existingAssessment = result;

          if (result.isCleared) {
            this.notification.success(
              'PAR-Q concluído! Aluno liberado para atividades físicas.',
            );
          } else {
            this.notification.warning(
              'PAR-Q concluído. Aluno deve apresentar atestado médico antes de iniciar as atividades.',
            );
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.notification.error(
            err.error?.errors?.[0] || 'Erro ao salvar avaliação PAR-Q.',
          );
        },
      });
  }

  /// Inicia uma nova avaliação limpando a existente.
  onNewAssessment(): void {
    this.notification
      .confirm({
        title: 'Nova Avaliação PAR-Q',
        message:
          'Deseja realizar uma nova avaliação PAR-Q? A avaliação anterior será mantida no histórico.',
        confirmLabel: 'Nova Avaliação',
        cancelLabel: 'Cancelar',
        type: 'info',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.existingAssessment = null;
          this.buildForm();
        }
      });
  }

  /// Volta para os detalhes do aluno.
  onBack(): void {
    this.router.navigate(['/students', this.studentId]);
  }
}
