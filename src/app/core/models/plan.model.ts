export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  weeklyFrequency: WeeklyFrequency;
  durationMonths: number;
  price: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanSummary {
  id: string;
  name: string;
  type: PlanType;
  weeklyFrequency: WeeklyFrequency;
  durationMonths: number;
  price: number;
  isActive: boolean;
}

export interface CreatePlanRequest {
  name: string;
  type: PlanType;
  weeklyFrequency: WeeklyFrequency;
  durationMonths: number;
  price: number;
  description?: string;
}

export interface UpdatePlanRequest {
  name: string;
  price: number;
  description?: string;
}

export enum PlanType {
  Monthly = 1,
  Quarterly = 2,
  SemiAnnual = 3,
  Annual = 4,
  ComboStrengthPilates = 5,
  Family = 6
}

export enum WeeklyFrequency {
  TwiceAWeek = 2,
  ThreeTimesAWeek = 3,
  FiveTimesAWeek = 5
}
