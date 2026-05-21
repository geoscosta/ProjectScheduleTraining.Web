import { StudentSummary } from './student.model';
import { ScheduleSummary } from './schedule.model';

export interface Scheduling {
  id: string;
  studentId: string;
  scheduleId: string;
  status: SchedulingStatus;
  isMakeup: boolean;
  justifiedAbsenceReason?: string;
  trainerNotes?: string;
  createdAt: string;
  updatedAt: string;
  student?: StudentSummary;
  schedule?: ScheduleSummary;
}

export interface SchedulingSummary {
  id: string;
  studentId: string;
  scheduleId: string;
  status: SchedulingStatus;
  isMakeup: boolean;
}

export interface CreateSchedulingRequest {
  studentId: string;
  scheduleId: string;
  isMakeup: boolean;
}

export interface CheckInRequest {
  trainerNotes?: string;
}

export interface JustifyAbsenceRequest {
  reason: string;
}

export enum SchedulingStatus {
  Scheduled = 1,
  Present = 2,
  JustifiedAbsence = 3,
  UnjustifiedAbsence = 4,
  Cancelled = 5,
  Makeup = 6
}
