import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/// Grupos musculares disponíveis para seleção.
const MUSCLE_GROUPS = [
  'Peitoral', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
  'Antebraço', 'Abdômen / Core', 'Glúteos', 'Quadríceps',
  'Posteriores de Coxa', 'Panturrilha', 'Corpo Inteiro', 'Cardio'
];

@Component({
  selector: 'app-student-workout-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    DragDropModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './student-workout-form.component.html',
  styleUrl: './student-workout-form.component.scss'
})
export class StudentWorkoutFormComponent implements OnInit {

  studentId = '';
  isLoading = true;
  isSaving = false;
  hasExistingWorkout = false;
  form!: FormGroup;
  muscleGroups = MUSCLE_GROUPS;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    this.buildForm();
    this.loadExistingWorkout();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      exercises: this.fb.array([])
    });

    /// Adiciona um exercício vazio ao iniciar.
    this.addExercise();
  }

  /// Getter para o FormArray de exercícios.
  get exercises(): FormArray {
    return this.form.get('exercises') as FormArray;
  }

  /// Cria um FormGroup para um exercício.
  private createExerciseGroup(): FormGroup {
    return this.fb.group({
      name:         ['', [Validators.required, Validators.maxLength(100)]],
      muscleGroup:  ['', [Validators.required]],
      sets:         [3, [Validators.required, Validators.min(1), Validators.max(20)]],
      repetitions:  ['12', [Validators.required]],
      load:         [null],
      restSeconds:  [60],
      notes:        [''],
      videoUrl:     [''],
      order:        [1]
    });
  }

  /// Adiciona um novo exercício ao final da lista.
  addExercise(): void {
    const group = this.createExerciseGroup();
    group.get('order')?.setValue(this.exercises.length + 1);
    this.exercises.push(group);
  }

  /// Remove um exercício pelo índice.
  removeExercise(index: number): void {
    if (this.exercises.length <= 1) {
      this.notification.warning('O treino deve ter pelo menos 1 exercício.');
      return;
    }
    this.exercises.removeAt(index);
    this.reorderExercises();
  }

  /// Reordena os exercícios após drag-and-drop.
  onDrop(event: CdkDragDrop<FormGroup[]>): void {
    const arr = this.exercises.controls;
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.reorderExercises();
  }

  /// Atualiza o campo order de todos os exercícios.
  private reorderExercises(): void {
    this.exercises.controls.forEach((ctrl, i) => {
      ctrl.get('order')?.setValue(i + 1);
    });
  }

  /// Carrega treino existente para edição se houver.
  private loadExistingWorkout(): void {
    this.http.get<any>(
      `${environment.apiUrl}/StudentWorkouts/student/${this.studentId}/active`
    ).subscribe({
      next: (workout) => {
        this.hasExistingWorkout = true;
        this.form.patchValue({
          name: workout.name,
          description: workout.description,
          startDate: new Date(workout.startDate),
          endDate: workout.endDate ? new Date(workout.endDate) : null
        });

        /// Preenche os exercícios existentes.
        this.exercises.clear();
        workout.exercises.forEach((e: any) => {
          const group = this.createExerciseGroup();
          group.patchValue(e);
          this.exercises.push(group);
        });

        this.isLoading = false;
      },
      error: () => {
        this.hasExistingWorkout = false;
        this.isLoading = false;
      }
    });
  }

  /// Salva o treino.
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const user = this.authService.getCurrentUser();
    const payload = {
      studentId: this.studentId,
      trainerId: user?.id,
      ...this.form.getRawValue(),
      exercises: this.exercises.getRawValue()
    };

    this.http.post(
      `${environment.apiUrl}/StudentWorkouts`,
      payload
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.notification.success(
          this.hasExistingWorkout
            ? 'Treino atualizado com sucesso.'
            : 'Treino criado com sucesso.'
        );
        this.router.navigate(['/students', this.studentId, 'workout']);
      },
      error: (err) => {
        this.isSaving = false;
        this.notification.error(
          err.error?.errors?.[0] || 'Erro ao salvar treino.'
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/students', this.studentId, 'workout']);
  }
}
