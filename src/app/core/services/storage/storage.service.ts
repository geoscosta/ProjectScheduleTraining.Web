import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly ACCESS_TOKEN_KEY = 'pst_access_token';
  private readonly REFRESH_TOKEN_KEY = 'pst_refresh_token';
  private readonly USER_KEY = 'pst_user';

  /// Armazena o access token no localStorage.
  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /// Retorna o access token armazenado ou null se não existir.
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /// Armazena o refresh token no localStorage.
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /// Retorna o refresh token armazenado ou null se não existir.
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /// Armazena os dados do usuário autenticado em formato JSON.
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /// Retorna os dados do usuário autenticado ou null se não existir.
  getUser<T>(): T | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) as T : null;
  }

  /// Remove todos os dados de autenticação do localStorage.
  /// Chamado no logout do usuário.
  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /// Verifica se existe um access token armazenado.
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
