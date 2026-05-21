import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

/// Guard responsável por proteger rotas que exigem perfis específicos.
/// Redireciona para o dashboard caso o usuário não possua o perfil necessário.
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as number[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authService.getCurrentUser();

  if (currentUser && requiredRoles.includes(currentUser.role)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
