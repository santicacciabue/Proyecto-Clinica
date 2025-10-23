import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../modules/auth/services/auth.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Obtener el token de LocalStorage
    const token = localStorage.getItem('token_acceso');
    

    // 2. Si el token existe, clonar la petición y añadir el header de autorización
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token 
        }
      });
    }
    
    // 3. Dejar que la petición continúe
    return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                
                // 🛑 Si el error es 401 (Token inválido o expirado)
                if (error.status === 401) {
                    console.error('Error 401: Token Expirado o no Autorizado');
                    
                    // a. Notificar al usuario (opcional, pero recomendado)
                    Swal.fire({
                        icon: 'error',
                        title: 'Sesión Expirada',
                        text: 'Tu sesión ha expirado. Serás redirigido al inicio de sesión.',
                        allowOutsideClick: false,
                        confirmButtonText: 'Aceptar',
                        timer: 3000
                    });
                    console.log(token)
                    // b. Limpiar la sesión
                    this.authService.cerrarSesion(); 
                    this.router.navigate(['/auth']);

                    // Devuelve un error para detener la ejecución de la petición original
                    return throwError(() => new Error('Token Expirado/No Autorizado. Redirigido.'));
                }
                
                return throwError(() => error);
            })
        );
  }
}
