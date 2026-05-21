import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Financial,
  FinancialSummary,
  CreateFinancialRequest,
  RegisterPaymentRequest
} from '../../models/financial.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  private readonly apiUrl = `${environment.apiUrl}/financials`;

  constructor(private http: HttpClient) {}

  /// Retorna os dados completos de uma cobrança pelo seu ID.
  getById(id: string): Observable<Financial> {
    return this.http.get<Financial>(`${this.apiUrl}/${id}`);
  }

  /// Retorna todas as cobranças de um aluno.
  getByStudentId(studentId: string): Observable<FinancialSummary[]> {
    return this.http.get<FinancialSummary[]>(`${this.apiUrl}/student/${studentId}`);
  }

  /// Retorna todas as cobranças vencidas do sistema.
  /// Utilizado para controle de inadimplência.
  getOverdue(): Observable<FinancialSummary[]> {
    return this.http.get<FinancialSummary[]>(`${this.apiUrl}/overdue`);
  }

  /// Cria uma nova cobrança financeira no sistema.
  create(request: CreateFinancialRequest): Observable<Financial> {
    return this.http.post<Financial>(this.apiUrl, request);
  }

  /// Registra o pagamento de uma cobrança financeira.
  registerPayment(id: string, request: RegisterPaymentRequest): Observable<Financial> {
    return this.http.patch<Financial>(`${this.apiUrl}/${id}/payment`, request);
  }

  /// Cancela uma cobrança financeira no sistema.
  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
