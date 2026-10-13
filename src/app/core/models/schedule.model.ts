export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  occupiedSlots: number;
  availableSlots: number;
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSummary {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  maxCapacity: number;
  occupiedSlots: number;
  availableSlots: number;
  status: ScheduleStatus;
  notes?: string;
}

export interface CreateScheduleRequest {
  date: string;
  startTime: string;
}

export interface BlockScheduleRequest {
  notes?: string;
}

export enum ScheduleStatus {
  Available = 1,
  Full = 2,
  Blocked = 3,
  Cancelled = 4
}

export enum SessionType {
  Pilates          = 1,
  SemiPersonalized = 2,
  Individual       = 3
}
