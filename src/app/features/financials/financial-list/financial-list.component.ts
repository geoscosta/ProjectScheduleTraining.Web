import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FinancialService } from '../../../core/services/financial/financial.service';
import { StudentService } from '../../../core/services/student/student.service';
import { FinancialSummary, FinancialStatus } from '../../../core/models/financial.model';
import { StudentSummary } from '../../../core/models/student.model';

@Component({
  selector: 'app-financial-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule
  ],
  templateUrl: './financial-list.component.html',
  styleUrl: './financial-list.component.scss'
})
export class FinancialListComponent implements OnInit {

  displayedColumns = ['dueDate', 'amount', 'status', 'actions'];
  financials: FinancialSummary[] = [];
  overdueFinancials: FinancialSummary[] = [];
  students: StudentSummary[] = [];
  isLoading = false;
  isLoadingOverdue = true;
  selectedStudentId = '';
  FinancialStatus = FinancialStatus;

  constructor(
    private financialService: FinancialService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadOverdue();
  }

  /// Carrega a lista de alunos para busca de cobranças.
  private loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (students) => this.students = students
    });
  }

  /// Carrega todas as cobranças vencidas do sistema.
  private loadOverdue(): void {
    this.isLoadingOverdue = true;
    this.financialService.getOverdue().subscribe({
      next: (financials) => {
        this.overdueFinancials = financials;
        this.isLoadingOverdue = false;
      },
      error: () => this.isLoadingOverdue = false
    });
  }

  /// Busca as cobranças do aluno selecionado.
  onSearchFinancials(studentId: string): void {
    if (!studentId) return;

    this.isLoading = true;
    this.financialService.getByStudentId(studentId).subscribe({
      next: (financials) => {
        this.financials = financials;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar cobranças.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /// Registra o pagamento de uma cobrança.
  onRegisterPayment(id: string): void {
    this.financialService.registerPayment(id, {}).subscribe({
      next: () => {
        this.snackBar.open('Pagamento registrado com sucesso.', 'Fechar', { duration: 3000 });
        this.onSearchFinancials(this.selectedStudentId);
        this.loadOverdue();
      },
      error: () => this.snackBar.open('Erro ao registrar pagamento.', 'Fechar', { duration: 3000 })
    });
  }

  /// Cancela uma cobrança financeira.
  onCancel(id: string): void {
    this.financialService.cancel(id).subscribe({
      next: () => {
        this.snackBar.open('Cobrança cancelada com sucesso.', 'Fechar', { duration: 3000 });
        this.onSearchFinancials(this.selectedStudentId);
        this.loadOverdue();
      },
      error: () => this.snackBar.open('Erro ao cancelar cobrança.', 'Fechar', { duration: 3000 })
    });
  }

  /// Retorna o label do status financeiro.
  getStatusLabel(status: FinancialStatus): string {
    const labels: Record<FinancialStatus, string> = {
      [FinancialStatus.Pending]: 'Pendente',
      [FinancialStatus.Paid]: 'Pago',
      [FinancialStatus.Overdue]: 'Vencido',
      [FinancialStatus.Cancelled]: 'Cancelado',
      [FinancialStatus.Exempt]: 'Isento'
    };
    return labels[status];
  }

  /// Retorna a classe CSS do badge de status.
  getStatusClass(status: FinancialStatus): string {
    const classes: Record<FinancialStatus, string> = {
      [FinancialStatus.Pending]: 'bg-yellow-100 text-yellow-700',
      [FinancialStatus.Paid]: 'bg-green-100 text-green-700',
      [FinancialStatus.Overdue]: 'bg-red-100 text-red-700',
      [FinancialStatus.Cancelled]: 'bg-gray-100 text-gray-700',
      [FinancialStatus.Exempt]: 'bg-blue-100 text-blue-700'
    };
    return classes[status];
  }
}
