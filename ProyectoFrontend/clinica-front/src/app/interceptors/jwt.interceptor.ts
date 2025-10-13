import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() {}

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
    return next.handle(request);
  }
}
