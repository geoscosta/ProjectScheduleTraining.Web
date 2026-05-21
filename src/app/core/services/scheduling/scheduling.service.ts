import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Scheduling,
  SchedulingSummary,
  CreateSchedulingRequest,
  CheckInRequest,
  JustifyAbsenceRequest
} from '../../models/scheduling.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {

  private readonly apiUrl = `${environment.apiUrl}/schedulings`;

  constructor(private http: HttpClient) {}

  /// Retorna os dados completos de um agendamento pelo seu ID.
  getById(id: string): Observable<Scheduling> {
    return this.http.get<Scheduling>(`${this.apiUrl}/${id}`);
  }

  /// Retorna todos os agendamentos de um aluno.
  getByStudentId(studentId: string): Observable<SchedulingSummary[]> {
    return this.http.get<SchedulingSummary[]>(`${this.apiUrl}/student/${studentId}`);
  }

  /// Retorna todos os agendamentos de um horário específico.
  /// Utilizado para controle de presença em uma turma.
  getByScheduleId(scheduleId: string): Observable<SchedulingSummary[]> {
    return this.http.get<SchedulingSummary[]>(`${this.apiUrl}/schedule/${scheduleId}`);
  }

  /// Cria um novo agendamento no sistema.
  create(request: CreateSchedulingRequest): Observable<Scheduling> {
    return this.http.post<Scheduling>(this.apiUrl, request);
  }

  /// Registra a presença de um aluno em uma aula.
  checkIn(id: string, request: CheckInRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/checkin`, request);
  }

  /// Registra a falta justificada de um aluno em uma aula.
  justifyAbsence(id: string, request: JustifyAbsenceRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/justify-absence`, request);
  }

  /// Cancela um agendamento no sistema.
  /// Libera automaticamente a vaga no horário correspondente.
  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
