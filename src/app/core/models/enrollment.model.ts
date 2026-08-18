import { StudentSummary } from './student.model';
import { PlanSummary } from './plan.model';

export interface Enrollment {
  id: string;
  studentId: string;
  planId: string;
  startDate: string;
  expirationDate: string;
  paymentDueDay: number;
  paymentMethod: number;
  discountPercentage: number;
  finalPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: StudentSummary | null;
  plan?: PlanSummary | null;
}

export interface EnrollmentSummary {
  id: string;
  studentId: string;
  planId: string;
  startDate: string;
  expirationDate: string;
  isActive: boolean;
}

export interface CreateEnrollmentRequest {
  studentId: string;
  planId: string;
  paymentDueDay: number;
  paymentMethod: number;
}

export interface RenewEnrollmentRequest {
  additionalMonths: number;
}
