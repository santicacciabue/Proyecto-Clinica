

import { Injectable } from '@angular/core';
import { 
    CanActivate, 
    CanLoad,
    Router, 
    ActivatedRouteSnapshot, 
    RouterStateSnapshot,
    Route, 
    UrlSegment,
    UrlTree
} from '@angular/router'; 
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad { // Implementa la interfaz CanActivate

  constructor(private authService: AuthService, private router: Router) {}

    // Lógica principal de chequeo, reutilizable por CanActivate y CanLoad
    private checkAuth(): boolean | UrlTree {
        if (this.authService.isLoggedIn()) {
            // El token es válido/existe
            return true;
        }
        
        // El token no es válido/no existe. Redirigir al login.
        return this.router.parseUrl(''); 
        // Nota: Usar parseUrl permite devolver un UrlTree, que es más robusto.
    }

    // Se ejecuta ANTES de cargar el código del módulo
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        console.log('AuthGuard: Comprobando con CanLoad para ruta:', route.path);
        return this.checkAuth();
    }

    // Se ejecuta ANTES de activar la ruta, si el módulo ya está cargado
    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        console.log('AuthGuard: Comprobando con CanActivate');
        return this.checkAuth();
    }
}