import { StudentSummary } from './student.model';

export interface Financial {
  id: string;
  studentId: string;
  enrollmentId?: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: FinancialStatus;
  description?: string;
  paymentProof?: string;
  createdAt: string;
  updatedAt: string;
  student?: StudentSummary;
}

export interface FinancialSummary {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: FinancialStatus;
}

export interface CreateFinancialRequest {
  studentId: string;
  enrollmentId?: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface RegisterPaymentRequest {
  paymentProof?: string;
}

export enum FinancialStatus {
  Pending = 1,
  Paid = 2,
  Overdue = 3,
  Cancelled = 4,
  Exempt = 5
}

/// Modelo de resposta do relatório financeiro mensal.
export interface FinancialReport {
  month: number;
  year: number;
  totalReceived: number;
  totalPending: number;
  totalOverdue: number;
  countReceived: number;
  countPending: number;
  countOverdue: number;
}
