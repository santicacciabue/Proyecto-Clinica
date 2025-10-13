// src/app/modules/auth/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; // Importar CanActivate
import { AuthService } from '../services/auth.service'; // Asegúrate de tener la ruta correcta

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate { // Implementa la interfaz CanActivate
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    
    // Si NO está logueado, redirige a la página de login
    this.router.navigate(['/auth/login']);
    return false;
  }
}