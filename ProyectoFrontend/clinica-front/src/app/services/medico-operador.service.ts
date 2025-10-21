import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicoOperadorService {

  private API_URL = 'http://localhost:4000/api';

  constructor(private http: HttpClient) { }

  // FUNCIONALIDADES DEL MÉDICO (AGENDA Y TURNOS)

  //Obtiene la lista de turnos programados para un médico en una fecha específica.  
  obtenerMisTurnosProgramados(fecha: string): Observable<any> {
    const body = { fecha };
    // POST /api/mis-turnos
    return this.http.post(`${this.API_URL}/mis-turnos`, body);
  }
  
 
  // Obtiene los rangos horarios de disponibilidad de un médico para una fecha.
  obtenerAgendaHorarios(id_medico: number, fecha: string): Observable<any> {
    // GET /api/horarios-medico/:id_medico?fecha=...
    return this.http.get(`${this.API_URL}/horarios-medico/${id_medico}`, { params: { fecha } });
  }

  
  // Crea un nuevo rango horario en la agenda del médico.
  // El body debe contener: {id_medico, id_especialidad, fecha, hora_entrada, hora_salida}.
  crearMiRangoHorario(data: any): Observable<any> {
    // POST /api/crear-mi-agenda
    return this.http.post(`${this.API_URL}/crear-mi-agenda`, data);
  }
  
  
  //Elimina un rango horario específico de la agenda.
  eliminarRangoHorario(id_horario: number): Observable<any> {
    // DELETE /api/eliminar-horario/:id
    return this.http.delete(`${this.API_URL}/eliminar-horario/${id_horario}`);
  }

  // FUNCIONALIDADES DEL OPERADOR

  //Obtiene la lista de médicos con agenda abierta para una fecha.
  obtenerMedicosConAgenda(fecha: string): Observable<any> {
    // GET /api/medicos-abiertos?fecha=...
    return this.http.get(`${this.API_URL}/medicos-abiertos`, { params: { fecha } });
  }

  // Obtener las especialidades asociadas a un médico
  // GET /api/obtenerEspecialidadesMedico/:id_medico
  obtenerEspecialidadesMedico(id_medico: number): Observable<any> {
    return this.http.get(`${this.API_URL}/obtenerEspecialidadesMedico/${id_medico}`);
  }
  
  // (Aquí van a ir otros métodos del operador: crear paciente, asignar turno, etc.)
  
}