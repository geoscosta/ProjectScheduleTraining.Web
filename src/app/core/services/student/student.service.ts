import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Student,
  StudentSummary,
  CreateStudentRequest,
  UpdateStudentRequest
} from '../../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  /// Retorna a lista de todos os alunos ativos do sistema.
  getAll(): Observable<StudentSummary[]> {
    return this.http.get<StudentSummary[]>(this.apiUrl);
  }

  /// Retorna os dados completos de um aluno pelo seu ID.
  getById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  /// Cria um novo aluno no sistema.
  create(request: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, request);
  }

  /// Atualiza os dados de um aluno existente.
  update(id: string, request: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, request);
  }

  /// Bloqueia um aluno no sistema.
  block(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/block`, {});
  }

  /// Desbloqueia um aluno no sistema.
  unblock(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/unblock`, {});
  }

  /// Inativa um aluno no sistema via soft delete.
  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
