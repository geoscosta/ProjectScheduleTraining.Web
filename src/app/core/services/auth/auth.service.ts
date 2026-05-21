import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import {
  AuthResponse,
  LoginRequest,
  RegisterUserRequest,
  UserAuthResponse,
  RefreshTokenRequest
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  /// BehaviorSubject que mantém o estado do usuário autenticado.
  /// Permite que componentes reajam a mudanças de autenticação.
  private currentUserSubject = new BehaviorSubject<UserAuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    /// Restaura o usuário autenticado do localStorage ao iniciar a aplicação.
    const user = this.storageService.getUser<UserAuthResponse>();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /// Realiza o login do usuário e armazena os tokens retornados.
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.storageService.setAccessToken(response.accessToken);
        this.storageService.setRefreshToken(response.refreshToken);
        this.storageService.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /// Registra um novo usuário no sistema.
  register(request: RegisterUserRequest): Observable<UserAuthResponse> {
    return this.http.post<UserAuthResponse>(`${this.apiUrl}/register`, request);
  }

  /// Renova o access token utilizando o refresh token armazenado.
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    const request: RefreshTokenRequest = { refreshToken: refreshToken! };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, request).pipe(
      tap(response => {
        this.storageService.setAccessToken(response.accessToken);
        this.storageService.setRefreshToken(response.refreshToken);
        this.storageService.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /// Realiza o logout do usuário, limpando os tokens e redirecionando para o login.
  logout(): void {
    const token = this.storageService.getAccessToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /// Retorna o usuário autenticado atual.
  getCurrentUser(): UserAuthResponse | null {
    return this.currentUserSubject.value;
  }

  /// Verifica se o usuário está autenticado.
  isAuthenticated(): boolean {
    return this.storageService.isAuthenticated();
  }

  /// Verifica se o usuário possui o perfil informado.
  hasRole(role: number): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
