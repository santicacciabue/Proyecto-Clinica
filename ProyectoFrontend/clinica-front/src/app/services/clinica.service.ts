// src/app/services/clinic.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClinicaService {

  // Asegúrate de que esta URL base sea correcta
  private urlBaseApi = 'http://localhost:4000/api'; 

  constructor(private http: HttpClient) { }

  // 1. OBTENER ESPECIALIDADES (GET /api/obtenerEspecialidades)
  obtenerEspecialidades(): Observable<any[]> {
    return this.http.get<any>(`${this.urlBaseApi}/obtenerEspecialidades`).pipe(
      map(respuesta => respuesta.payload) 
    );
  }

  obtenerEspecialidadesPorCobertura(id_cobertura: number): Observable<any[]> {
    // Asegúrate que esta URL coincida con tu endpoint
    return this.http.get<any>(`${this.urlBaseApi}/obtenerEspecialidadesPorCobertura/${id_cobertura}`).pipe(
      map(respuestaApi => respuestaApi.payload || []) 
    );
  }

  // 2. OBTENER MÉDICOS POR ESPECIALIDAD (GET /api/obtenerMedicoPorEspecialidad/:id)
  obtenerMedicosPorEspecialidad(id_especialidad: number): Observable<any[]> {
    return this.http.get<any>(`${this.urlBaseApi}/obtenerMedicoPorEspecialidad/${id_especialidad}`).pipe(
      map(respuestaApi => respuestaApi.payload || []) 
    );
  }
  
  // 3. OBTENER RANGOS DE TRABAJO (AGENDA) - (GET /api/obtenerAgenda/:id_medico)
  // Devuelve los rangos de hora_entrada/salida de la tabla 'agenda'.
  obtenerAgenda(id_medico: number): Observable<any[]> {
    return this.http.get<any>(`${this.urlBaseApi}/obtenerAgenda/${id_medico}`).pipe(
        
        map(respuesta => respuesta.payload || []) 
    );
  }


  // Llama al endpoint simple que devuelve SOLO las horas reservadas.
  obtenerHorasOcupadas(id_medico: number, fecha: string): Observable<any[]> {
    const url = `${this.urlBaseApi}/obtenerHorasOcupadas`; // <--- ¡NUEVO ENDPOINT!
      // Se mantiene POST para enviar el id_medico y fecha
    return this.http.post<any>(url, { id_medico, fecha }).pipe( 
    // Protección: asegura que si algo falla, siempre retorna un array vacío []
      map(respuesta => respuesta.payload || [])
    );
  }


  // 4. OBTENER TURNOS ASIGNADOS (Horas ocupadas para un médico/fecha)
  // Usa el endpoint POST /api/obtenerTurnosMedico
  obtenerTurnosAsignados(id_medico: number, fecha: string): Observable<any[]> {
     const url = `${this.urlBaseApi}/obtenerTurnosMedico`;
     // Tu API espera los datos en el cuerpo del POST
     return this.http.post<any>(url, { id_medico, fecha }).pipe( 
        map(respuesta => respuesta.payload || []) 
     );
  }
  
  // 5. ASIGNAR TURNO (POST /api/asignarTurnoPaciente)
  solicitarTurno(datosTurno: { nota: string, id_agenda: number, fecha: string, hora: string, id_paciente: number, id_cobertura: number }): Observable<any> {
    const url = `${this.urlBaseApi}/asignarTurnoPaciente`;
    return this.http.post<any>(url, datosTurno);
  }

  // 6. OBTENER TURNOS DEL PACIENTE (GET /api/obtenerTurnoPaciente/:id) - Para "Mis Turnos"
  obtenerTurnosPaciente(id_paciente: number): Observable<any[]> {
    const url = `${this.urlBaseApi}/obtenerTurnoPaciente/${id_paciente}`;
    return this.http.get<any>(url).pipe(
        map(respuesta => {
            if (respuesta.codigo === 200) {
                // Ordenar por fecha y hora (más próximo primero)
                return respuesta.payload.sort((a: any, b: any) => {
                    const fechaA = new Date(`${a.fecha}T${a.hora}`);
                    const fechaB = new Date(`${b.fecha}T${b.hora}`);
                    return fechaA.getTime() - fechaB.getTime(); 
                });
            }
            return [];
        })
    );
  }
}