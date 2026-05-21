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
  availableSlots: number;
  status: ScheduleStatus;
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
