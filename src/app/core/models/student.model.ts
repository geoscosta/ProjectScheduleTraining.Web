export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  address?: string;
  emergencyContact?: string;
  photoUrl?: string;
  internalNotes?: string;
  status: StudentStatus;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
}

export interface CreateStudentRequest {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  address?: string;
  emergencyContact?: string;
}

export interface UpdateStudentRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  emergencyContact?: string;
}

export enum StudentStatus {
  Active = 1,
  Inactive = 2,
  Blocked = 3
}
