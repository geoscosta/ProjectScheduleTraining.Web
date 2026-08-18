import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Enrollment,
  EnrollmentSummary,
  CreateEnrollmentRequest,
  RenewEnrollmentRequest,
} from '../../models/enrollment.model';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private readonly apiUrl = `${environment.apiUrl}/enrollments`;

  constructor(private http: HttpClient) {}

  /// Retorna os dados completos de uma matrícula pelo seu ID.
  getById(id: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/${id}`);
  }

  /// Retorna a matrícula ativa de um aluno pelo ID do aluno.
  getByStudentId(studentId: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/student/${studentId}`);
  }

  /// Cria uma nova matrícula no sistema.
  create(request: CreateEnrollmentRequest): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, request);
  }

  /// Renova uma matrícula existente adicionando meses ao prazo atual.
  renew(id: string, request: RenewEnrollmentRequest): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/${id}/renew`, request);
  }

  /// Cancela uma matrícula com opção de multa ou substituto.
  cancel(
    id: string,
    cancellationOption?: number | null,
    substituteStudentId?: string | null,
  ): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      body: {
        cancellationOption: cancellationOption ?? null,
        substituteStudentId: substituteStudentId ?? null,
      },
    });
  }
}
