import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student/student.service';
import { StudentSummary, StudentStatus } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit {

  displayedColumns = ['name', 'email', 'phone', 'status', 'actions'];
  students: StudentSummary[] = [];
  filteredStudents: StudentSummary[] = [];
  isLoading = true;
  searchTerm = '';
  StudentStatus = StudentStatus;

  constructor(
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /// Carrega a lista de alunos ativos do sistema.
  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = students;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Erro ao carregar alunos.');
      }
    });
  }

  /// Filtra os alunos pelo termo de busca.
  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  }

  /// Bloqueia um aluno no sistema.
  onBlock(id: string): void {
    this.studentService.block(id).subscribe({
      next: () => {
        this.showSuccess('Aluno bloqueado com sucesso.');
        this.loadStudents();
      },
      error: () => this.showError('Erro ao bloquear aluno.')
    });
  }

  /// Desbloqueia um aluno no sistema.
  onUnblock(id: string): void {
    this.studentService.unblock(id).subscribe({
      next: () => {
        this.showSuccess('Aluno desbloqueado com sucesso.');
        this.loadStudents();
      },
      error: () => this.showError('Erro ao desbloquear aluno.')
    });
  }

  /// Inativa um aluno no sistema.
  onDeactivate(id: string): void {
    this.studentService.deactivate(id).subscribe({
      next: () => {
        this.showSuccess('Aluno inativado com sucesso.');
        this.loadStudents();
      },
      error: () => this.showError('Erro ao inativar aluno.')
    });
  }

  /// Retorna o label do status do aluno.
  getStatusLabel(status: StudentStatus): string {
    const labels: Record<StudentStatus, string> = {
      [StudentStatus.Active]: 'Ativo',
      [StudentStatus.Inactive]: 'Inativo',
      [StudentStatus.Blocked]: 'Bloqueado'
    };
    return labels[status];
  }

  /// Retorna a classe CSS do chip de status.
  getStatusClass(status: StudentStatus): string {
    const classes: Record<StudentStatus, string> = {
      [StudentStatus.Active]: 'bg-green-100 text-green-700',
      [StudentStatus.Inactive]: 'bg-gray-100 text-gray-700',
      [StudentStatus.Blocked]: 'bg-red-100 text-red-700'
    };
    return classes[status];
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-success' });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: 'snack-error' });
  }
}
