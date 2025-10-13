import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// Importamos map para transformar la respuesta del servidor
import { Observable, BehaviorSubject, map } from 'rxjs'; 
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  // URL base de tu API de Node.js
  private urlBaseApi = 'http://localhost:4000/api'; 
  
  // Usamos BehaviorSubject para guardar el estado de la sesión (true/false)
  private estadoSesion = new BehaviorSubject<boolean>(this.verificarToken());

  // Este Observable es para que otros componentes (ej. Header) se suscriban y reaccionen a los cambios
  sesionIniciada$ = this.estadoSesion.asObservable(); 

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE UTILIDAD INTERNA ---

  private verificarToken(): boolean {
    // Comprueba si existe el token en LocalStorage
     return !!localStorage.getItem('token_acceso');
  }

  // --- MÉTODOS PARA LLAMADAS A LA API ---

  // 1. OBTENER COBERTURAS (GET /api/coberturas)
  obtenerCoberturas(): Observable<any[]> {
    // Apuntamos a la ruta exacta de tu controlador de "Clínica"
    // El Back-end devuelve un array dentro de 'payload' si el código es 200.
    return this.http.get<any[]>(`${this.urlBaseApi}/obtenerCoberturas`).pipe(
        map((respuestaApi: any) => respuestaApi.payload)
    );
  }

// Función de utilidad para formatear la fecha a 'YYYY-MM-DD'
  private formatearFecha(fecha: Date | string): string {
    // Si Angular nos pasa un objeto Date, lo formateamos.
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    // Si ya es un string, intentamos convertirlo a Date para formatear (útil con el DatePicker)
    try {
        const d = new Date(fecha);
        // Aseguramos que solo se envíe la parte de la fecha (YYYY-MM-DD)
        return d.toISOString().split('T')[0]; 
    } catch {
        return fecha.toString(); // Devolvemos el string original si falla la conversión
    }
  }


  // 2. REGISTRAR PACIENTE (POST /crearUsuario)
  registrarPaciente(datosUsuario: any): Observable<any> {
    
    // --- PASO CRÍTICO: ADAPTAR DATOS PARA EL BACK-END ---
    const datosParaApi = {
        ...datosUsuario,
        // El Back-end espera el campo 'fecha_nacimiento' con guion bajo
        fecha_nacimiento: this.formatearFecha(datosUsuario.fechaNacimiento),
        
        // Asignamos el rol por defecto de 'paciente' (según la lógica de la app)
        rol: 'paciente',
        
        // Eliminamos la clave original del Front-end para evitar duplicados
        fechaNacimiento: undefined, 
    };

    // Filtramos para eliminar la clave 'fechaNacimiento' y la innecesaria 'repeatPassword'
    delete datosParaApi.fechaNacimiento;
    delete datosParaApi.repeatPassword;

    // Ahora sí, enviamos el objeto 'datosParaApi' a la ruta correcta
    return this.http.post(`${this.urlBaseApi}/crearUsuario`, datosParaApi);
  }

  // 3. INICIAR SESIÓN (POST /login)
  iniciarSesion(credenciales: any): Observable<any> {
    // La ruta es /login según tus rutas de Back-end
    return this.http.post(`${this.urlBaseApi}/login`, credenciales).pipe(
      // Usamos map para adaptar la respuesta del servidor antes de que llegue al componente
      map((respuestaApi: any) => { 
        
        // **ESTA ES LA CLAVE:** Verificamos tu código de éxito (200)
        if (respuestaApi.codigo === 200 && respuestaApi.jwt) {
          
          // Tu Back-end devuelve el usuario en el array 'payload'
          const datosUsuario = respuestaApi.payload[0];
          
          // Guardamos datos clave en LocalStorage con nombres claros
          localStorage.setItem('token_acceso', respuestaApi.jwt);
          localStorage.setItem('rol_usuario', datosUsuario.rol);
          // Concatenamos nombre y apellido para el header
          localStorage.setItem('nombre_usuario', `${datosUsuario.nombre} ${datosUsuario.apellido}`); 
          
          this.estadoSesion.next(true); // Emitimos el cambio de estado de sesión
          return { exito: true, usuario: datosUsuario }; // Retornamos un objeto limpio
        } else {
          // Si el código no es 200, lanzamos un error con el mensaje de tu Back-end
          throw new Error(respuestaApi.mensaje || 'Error de credenciales no especificado.');
        }
      })
    );
  }

 

  // 4. CERRAR SESIÓN
  cerrarSesion(): void {
    localStorage.removeItem('token_acceso');
    localStorage.removeItem('rol_usuario');
    localStorage.removeItem('nombre_usuario');
    this.estadoSesion.next(false);
  }

  // --- MÉTODOS DE ACCESO PÚBLICO ---

  // 5. METODO PÚBLICO PARA EL GUARD
  isLoggedIn(): boolean {
      // Simplemente llama al método privado corregido
      return this.verificarToken();
  }

  obtenerNombreCompleto(): string | null {
    return localStorage.getItem('nombre_usuario');
  }
  
  obtenerRolUsuario(): string | null {
    return localStorage.getItem('rol_usuario');
  }

 /**
     * Decodifica el token JWT almacenado y devuelve los datos del usuario (payload).
     * @returns Los datos del usuario o null si no hay token o es inválido.
     */
    obtenerDatosUsuario(): any {
        const token = localStorage.getItem('token_acceso');
        
        if (!token) {
            return null;
        }

        try {
            // Decodifica el token para obtener el payload
            const payload: any = jwtDecode(token);
            console.log(payload)
            // CRÍTICO: AJUSTA LOS NOMBRES DE LAS PROPIEDADES 
            // a como se llaman REALMENTE en el token de tu back-end.
            return {
              id: payload.id, // Asumiendo que el ID es 'id' o 'id_usuario'
              nombre: payload.nombre,
              apellido: payload.apellido,
              rol: payload.rol,
              id_cobertura: payload.id_cobertura, 
              nombre_cobertura: payload.nombre_cobertura
          }
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            // Esto también manejará la expiración si tu backend usa el campo 'exp'
            this.cerrarSesion();
            return null;
        }
    }
}