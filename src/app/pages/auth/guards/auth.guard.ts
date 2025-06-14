import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router); 
  
  if (authService.isAuthenticated()) {
    console.log('Usuario autenticado, acceso permitido.');
    return true;
  } else {
    console.log('Usuario no autenticado, redirigiendo a la página de inicio de sesión.');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
};
