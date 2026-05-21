import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { StorageService } from '../services/storage/storage.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  /// Adiciona o token JWT no header Authorization de todas as requisições.
  const token = storageService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      /// Tenta renovar o token automaticamente quando recebe 401 Unauthorized.
      if (error.status === 401 && !req.url.includes('/auth/')) {
        const refreshToken = storageService.getRefreshToken();

        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap(response => {
              /// Refaz a requisição original com o novo token.
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              /// Se o refresh token também falhar, redireciona para o login.
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        }

        /// Se não houver refresh token, redireciona para o login.
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
