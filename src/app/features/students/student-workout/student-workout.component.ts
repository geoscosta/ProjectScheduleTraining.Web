import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

/// Modelo de exercício do treino.
interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  repetitions: string;
  load?: number;
  restSeconds?: number;
  notes?: string;
  order: number;
  videoUrl?: string;
}

/// Modelo de treino personalizado.
interface StudentWorkout {
  id: string;
  studentId: string;
  trainerId: string;
  trainerName: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  exercises: WorkoutExercise[];
}

@Component({
  selector: 'app-student-workout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    BadgeComponent,
  ],
  templateUrl: './student-workout.component.html',
  styleUrl: './student-workout.component.scss',
})
export class StudentWorkoutComponent implements OnInit {
  studentId = '';
  isLoading = true;
  workout: StudentWorkout | null = null;
  isTrainerOrAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';

    const user = this.authService.getCurrentUser();
    this.isTrainerOrAdmin = user?.role === 1 || user?.role === 2;

    this.loadWorkout();
  }

  /// Carrega o treino ativo do aluno.
  private loadWorkout(): void {
    this.isLoading = true;
    this.http
      .get<StudentWorkout>(
        `${environment.apiUrl}/StudentWorkouts/student/${this.studentId}/active`,
      )
      .subscribe({
        next: (workout) => {
          this.workout = workout;
          this.isLoading = false;
        },
        error: () => {
          this.workout = null;
          this.isLoading = false;
        },
      });
  }

  /// Retorna o ícone do grupo muscular.
  getMuscleGroupIcon(muscleGroup: string): string {
    const lower = muscleGroup.toLowerCase();
    if (lower.includes('peito') || lower.includes('peitoral'))
      return 'fitness_center';
    if (lower.includes('costas') || lower.includes('dorsal'))
      return 'accessibility_new';
    if (
      lower.includes('perna') ||
      lower.includes('quadríceps') ||
      lower.includes('glúteo')
    )
      return 'directions_walk';
    if (lower.includes('ombro') || lower.includes('deltóide'))
      return 'sports_gymnastics';
    if (
      lower.includes('bíceps') ||
      lower.includes('tríceps') ||
      lower.includes('braço')
    )
      return 'sports_handball';
    if (lower.includes('abdômen') || lower.includes('core'))
      return 'self_improvement';
    return 'fitness_center';
  }

  /// Retorna o total de séries de todos os exercícios.
  get totalSets(): number {
    if (!this.workout) return 0;
    return this.workout.exercises.reduce((acc, e) => acc + e.sets, 0);
  }

  /// Retorna a ordem do último exercício.
  get lastExerciseOrder(): number {
    if (!this.workout || this.workout.exercises.length === 0) return 0;
    return this.workout.exercises[this.workout.exercises.length - 1].order;
  }

  /// Formata o tempo de descanso para exibição.
  formatRest(seconds?: number): string {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}min ${sec}s` : `${min}min`;
  }

  onBack(): void {
    this.router.navigate(['/students', this.studentId]);
  }

  onEdit(): void {
    this.router.navigate(['/students', this.studentId, 'workout', 'form']);
  }
}
