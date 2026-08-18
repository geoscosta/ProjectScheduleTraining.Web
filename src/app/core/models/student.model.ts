export enum StudentStatus {
  Active = 1,
  Inactive = 2,
  Blocked = 3
}

export enum MaritalStatus {
  Single = 1,
  Married = 2,
  Divorced = 3,
  Widowed = 4,
  StableUnion = 5
}

export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  photoUrl?: string;

  /// Novos campos do contrato.
  profession?: string;
  maritalStatus?: MaritalStatus;
  identityDocument?: string;

  /// Endereço estruturado.
  street?: string;
  addressNumber?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  /// Responsável legal.
  guardianName?: string;
  guardianCpf?: string;

  /// Documentação e termos.
  registrationFeePaid: boolean;
  healthCertificateExpiresAt?: string;
  imageRightsAccepted: boolean;
  internalRegulationAccepted: boolean;

  /// Contato e status.
  emergencyContact?: string;
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
  profession?: string;
  maritalStatus?: MaritalStatus;
  identityDocument?: string;
  street?: string;
  addressNumber?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  guardianName?: string;
  guardianCpf?: string;
  emergencyContact?: string;
  imageRightsAccepted: boolean;
  internalRegulationAccepted: boolean;
}

export interface UpdateStudentRequest {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  profession?: string;
  maritalStatus?: MaritalStatus;
  identityDocument?: string;
  street?: string;
  addressNumber?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  guardianName?: string;
  guardianCpf?: string;
  emergencyContact?: string;
  imageRightsAccepted: boolean;
  internalRegulationAccepted: boolean;
}
