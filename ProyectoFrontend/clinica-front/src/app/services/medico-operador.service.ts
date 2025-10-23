import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HorarioAgenda } from '../modules/operador/detalle-medico-agenda/detalle-medico-agenda.models';

export interface Cobertura {
  id: number;
  nombre: string;
}

export interface RegistroPaciente {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  dni: string;
  fecha_nacimiento: string;
  telefono: string;
  id_cobertura: number | null;
}

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

  obtenerMedicosConAgenda(fecha: string): Observable<any> {
    return this.http.get(`${this.API_URL}/medicos-abiertos`, { params: { fecha } });
  }

  obtenerEspecialidadesMedico(id_medico: number): Observable<any> {
    return this.http.get(`${this.API_URL}/obtenerEspecialidadesMedico/${id_medico}`);
  }
  
  obtenerTurnosMedicoOperador(id_medico: number, fecha: string): Observable<any> {
    const body = { id_medico, fecha };
    return this.http.post(`${this.API_URL}/obtenerTurnosMedico`, body);
  }

  modificarRangoHorario(data: HorarioAgenda): Observable<any> {
    return this.http.put(`${this.API_URL}/modificarAgenda/${data.id}`, data);
  }

  obtenerCoberturas(): Observable<any> {
    return this.http.get(`${this.API_URL}/obtenerCoberturas`);
  }

  registrarPaciente(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/usuarios/crearUsuario`, data);
  }

  actualizarTurno(id_turno: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}actualizarTurnoPaciente/${id_turno}`, data);
  }

  eliminarTurno(id_turno: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminarTurnoPaciente/${id_turno}`); 
  }
  
  //metodos para el componente asignar turno

  //  Buscar Pacientes por DNI/Apellido
  buscarPacientes(termino: string): Observable<any> {
    const body = { termino };
    return this.http.post(`${this.API_URL}/usuarios/buscarPacientes`, body);
  }

  //  Buscar Pacientes por id
  buscarUsuario(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/usuarios/${id}`);
  }

  //  Obtener la lista de Especialidades
  obtenerEspecialidades(): Observable<any> {

    return this.http.get(`${this.API_URL}/obtenerEspecialidades`);
  }

  //  Obtener Médicos por Especialidad (Nuevo método auxiliar para el Paso 2)
  obtenerMedicosPorEspecialidad(id_especialidad: number): Observable<any> {
    return this.http.get(`${this.API_URL}/obtenerMedicoPorEspecialidad/${id_especialidad}`);
  }


  //  Obtener Disponibilidad (Horas Ocupadas) (AJUSTADO)
  obtenerHorasOcupadas(id_medico: number, fecha: string): Observable<any> {
    const body = { id_medico, fecha };
    return this.http.post(`${this.API_URL}/obtenerHorasOcupadas`, body);
  }

  // Asignar Turno Final
  asignarTurno(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/asignarTurnoPacienteOperador`, data);
  }

  obtenerEspecialidadesPorCobertura(id_cobertura: number | null): Observable<any> {
    let params = new HttpParams();
    if (id_cobertura !== null) {
        // HttpParams.set() convierte automáticamente a string, que es lo esperado.
        params = params.set('id_cobertura', String(id_cobertura)); 
    }
    // LLAMA A: GET /api/obtenerEspecialidadesPorCobertura (con o sin ?id_cobertura=X)
    return this.http.get(`${this.API_URL}/obtenerEspecialidadesPorCobertura`, { params });
  }

  obtenerEspecialidadPorMedico(id_medico: number): Observable<any> {
    return this.http.get(`${this.API_URL}/obtenerEspecialidadesMedico/${id_medico}`);
  }

}