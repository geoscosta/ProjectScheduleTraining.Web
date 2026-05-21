import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Schedule,
  ScheduleSummary,
  CreateScheduleRequest,
  BlockScheduleRequest
} from '../../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  /// Retorna os dados completos de um horário pelo seu ID.
  getById(id: string): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/${id}`);
  }

  /// Retorna todos os horários de uma data específica.
  getByDate(date: string): Observable<ScheduleSummary[]> {
    return this.http.get<ScheduleSummary[]>(`${this.apiUrl}/date/${date}`);
  }

  /// Retorna todos os horários de um período.
  /// Utilizado para visualização semanal e mensal da agenda.
  getByPeriod(start: string, end: string): Observable<ScheduleSummary[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<ScheduleSummary[]>(`${this.apiUrl}/period`, { params });
  }

  /// Cria um novo horário na agenda.
  create(request: CreateScheduleRequest): Observable<Schedule> {
    return this.http.post<Schedule>(this.apiUrl, request);
  }

  /// Bloqueia um horário na agenda.
  block(id: string, request: BlockScheduleRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/block`, request);
  }

  /// Cancela um horário na agenda.
  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
