

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
        {
        
        // 1. **AUTENTICACIÓN:** Primero, verificamos que el usuario esté logueado.
        const userCheck = this.checkAuth();
        if (userCheck !== true) {
            return userCheck; // Si no está logueado, redirige al login.
        }

        // 2. **AUTORIZACIÓN (ROLES):** Obtenemos los roles requeridos de la ruta.
        // Los roles deben definirse en el routing con: data: { roles: ['Rol1', 'Rol2'] }
        const rolesRequeridos = route.data['roles'] as Array<string>;

        // Si la ruta no tiene roles definidos, permite el acceso a cualquier logueado.
        if (!rolesRequeridos || rolesRequeridos.length === 0) {
            return true;
        }

        // 3. Obtener el rol del usuario (lo traemos del localStorage, es la forma más rápida)
        // Usamos toLowerCase() por si hay inconsistencia de mayúsculas entre la DB y la ruta
        const rolUsuario = this.authService.obtenerRolUsuario()?.toLowerCase();
        

        console.log('ROL REQUERIDO POR LA RUTA:', rolesRequeridos); 
        console.log('ROL DEL USUARIO LOGUEADO:', rolUsuario);
        // 4. Comprobar si el rol del usuario coincide con alguno de los requeridos
        const autorizado = rolesRequeridos.some(rolReq => rolReq.toLowerCase() === rolUsuario);

        if (autorizado) {
            console.log(`AuthGuard: Acceso concedido para rol ${rolUsuario} en ruta ${state.url}`);
            return true; // Acceso permitido
        } else {
            // 5. REDIRECCIÓN DE ACCESO DENEGADO
            console.warn(`AuthGuard: ACCESO DENEGADO. Rol ${rolUsuario} intentó acceder a ruta para ${rolesRequeridos.join(', ')}`);
            
            // Redirigir a una ruta por defecto para usuarios sin permiso (ej. el dashboard o home)
            // Esto evita que vean la URL de la ruta restringida.
            // Nota: Aquí podrías redirigir a un dashboard específico según el rol.
            return this.router.parseUrl(''); 
        }
    }
    }
}