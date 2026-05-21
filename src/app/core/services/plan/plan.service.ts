import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Plan,
  PlanSummary,
  CreatePlanRequest,
  UpdatePlanRequest
} from '../../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private readonly apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  /// Retorna a lista de todos os planos ativos do sistema.
  getAll(): Observable<PlanSummary[]> {
    return this.http.get<PlanSummary[]>(this.apiUrl);
  }

  /// Retorna os dados completos de um plano pelo seu ID.
  getById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  /// Cria um novo plano no sistema.
  create(request: CreatePlanRequest): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, request);
  }

  /// Atualiza os dados de um plano existente.
  update(id: string, request: UpdatePlanRequest): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, request);
  }

  /// Desativa um plano no sistema.
  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
