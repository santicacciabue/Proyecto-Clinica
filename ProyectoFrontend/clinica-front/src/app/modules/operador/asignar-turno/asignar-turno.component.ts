// src/app/modules/operador/asignar-turno/asignar-turno.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoOperadorService } from '../../../services/medico-operador.service';
import { HorarioAgenda } from '../detalle-medico-agenda/detalle-medico-agenda.models';
import { Router, ActivatedRoute } from '@angular/router';

// Interfaz Paciente (asumo que tendrás un endpoint para buscar pacientes)
export interface PacienteBusqueda {
  id: number;
  nombre_completo: string; // "Apellido, Nombre"
  dni: string;
  id_cobertura: number | null;
}

// Interfaz Especialidad (si tu backend las devuelve)
export interface Especialidad {
  id: number;
  descripcion: string;
}

@Component({
  selector: 'app-asignar-turno',
  templateUrl: './asignar-turno.component.html',
  styleUrls: ['./asignar-turno.component.css']
})
export class AsignarTurnoComponent implements OnInit {

  // --- PASOS Y ESTADOS ---
  pasoActual: number = 1;
  cargando = false;
  mensajeError = '';

  // --- DATOS DEL FORMULARIO ---
  formularioAsignar!: FormGroup;

  // --- DATOS DE LISTAS ---
  pacientesEncontrados: PacienteBusqueda[] = [];
  especialidades: Especialidad[] = [];
  medicos: any[] = []; // Médicos que atienden la especialidad
  horariosDisponibles: HorarioAgenda[] = []; // Horarios libres

  // --- SELECCIONES ---
  pacienteSeleccionado: PacienteBusqueda | null = null;
  turnoSeleccionado: HorarioAgenda | null = null;

  constructor(
    private fb: FormBuilder,
    private medicoOperadorService: MedicoOperadorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formularioAsignar = this.fb.group({
      //  Búsqueda y Selección de Paciente
      busquedaPaciente: ['', Validators.required],
      
      // Selección de Criterios del Turno
      id_especialidad: [null, Validators.required],
      id_medico: [null, Validators.required],
      fecha: ['', Validators.required],

      nota: ['']
    });

    this.checkPreselecciones();

    this.formularioAsignar.get('id_especialidad')?.valueChanges.subscribe(id_especialidad => {
        if (id_especialidad) {
            this.cargarMedicos(id_especialidad);
            this.formularioAsignar.get('id_medico')?.setValue(null); // Resetear médico al cambiar especialidad
        }
    });
  }

  cargarMedicos(id_especialidad: number): void {
      this.medicos = [];
      this.medicoOperadorService.obtenerMedicosPorEspecialidad(id_especialidad).subscribe({
          next: (res) => {
              if (res.codigo === 200) {
                  this.medicos = (res.payload || []).map((medico: any) => ({
                      ...medico,
                      nombre_completo: `${medico.apellido}, ${medico.nombre}`
                  }));
                  
                  if (this.medicos.length === 0) {
                      alert('No hay médicos para esta especialidad.');
                  }
              }
          },
          error: () => { 
             this.medicos = [];
             alert('Error al cargar médicos por especialidad.');
          }
      });
  }

  // Verificar si vinimos desde DetalleMedicoAgendaComponent
  checkPreselecciones(): void {
    this.route.queryParams.subscribe(params => {
        const preseleccionarMedico = params['id_medico'];
        const preseleccionarFecha = params['fecha'];

        if (preseleccionarMedico) {
                // Usamos setValue o patchValue para actualizar el formulario.
                this.formularioAsignar.patchValue({
                    id_medico: +preseleccionarMedico,
                    fecha: preseleccionarFecha
                });
            }
    });
  }


  buscarPacientes(): void {
    const termino = this.formularioAsignar.get('busquedaPaciente')?.value;
    if (!termino || termino.length < 3) {
      this.pacientesEncontrados = [];
      return;
    }
    
    this.cargando = true;
    this.pacientesEncontrados = []; // Limpiar resultados anteriores

    // Usamos el servicio que apunta a /api/usuarios/buscarPacientes
    this.medicoOperadorService.buscarPacientes(termino).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 200) {
          // La API devuelve: { id, dni, nombre_completo }
          this.pacientesEncontrados = res.payload || []; 
        } else {
          this.pacientesEncontrados = [];
          this.mensajeError = res.mensaje; // Muestra "Debe ingresar al menos 3 caracteres..."
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = 'Error al buscar pacientes en el servidor.';
        console.error('Error de API:', err);
      }
    });
  }

  seleccionarPaciente(paciente: PacienteBusqueda): void {
    this.pacienteSeleccionado = paciente;
    this.pasoActual = 2
    this.mensajeError = '';
    this.pacientesEncontrados = [];
    this.cargarEspecialidades(paciente.id_cobertura);
    const idMedicoPreseleccionado = this.formularioAsignar.get('id_medico')?.value;
    
    if (idMedicoPreseleccionado) {  
        this.buscarDisponibilidad();
    }
}


  cargarEspecialidades(id_cobertura: number | null): void {
    this.especialidades = [];
    
    this.medicoOperadorService.obtenerEspecialidadesPorCobertura(id_cobertura).subscribe({
        next: (res) => {
            if (res.codigo === 200) {
                this.especialidades = res.payload || [];
            } else {
                this.mensajeError = 'Error al cargar especialidades: ' + res.mensaje;
            }
        },
        error: () => {
            this.mensajeError = 'Error de conexión al obtener especialidades.';
        }
    });
    
  }

  buscarDisponibilidad(): void {
    const { id_medico, fecha } = this.formularioAsignar.value;
    
    if (this.formularioAsignar.get('id_medico')?.invalid || this.formularioAsignar.get('fecha')?.invalid) {
      alert('Seleccione Médico y Fecha.');
      return;
    }
    
    this.cargando = true;
    this.horariosDisponibles = [];
    
    // 1. Obtener la agenda (rangos de trabajo) del médico para esa fecha
    this.medicoOperadorService.obtenerAgendaHorarios(id_medico, fecha).subscribe({
        next: (resAgenda) => {
            if (resAgenda.codigo !== 200 || resAgenda.payload.length === 0) {
                this.cargando = false;
                alert('El médico no tiene agenda abierta en esa fecha.');
                return;
            }
            const agenda = resAgenda.payload as HorarioAgenda[];
            
            // 2. Obtener las horas ya ocupadas (turnos confirmados)
            this.medicoOperadorService.obtenerHorasOcupadas(id_medico, fecha).subscribe({
                next: (resOcupadas) => {
                    this.cargando = false;
                    const horasOcupadas: string[] = resOcupadas.payload.map((t: any) => t.hora); // Asumo que devuelve { hora: 'HH:MM' }
                    
                    // 3. Calcular las horas disponibles
                    this.horariosDisponibles = this.calcularHorasLibres(agenda, horasOcupadas);

                    if (this.horariosDisponibles.length === 0) {
                        alert('No hay turnos libres para los criterios seleccionados.');
                    }
                },
                error: () => {
                    this.cargando = false;
                    this.mensajeError = 'Error al obtener horas ocupadas.';
                }
            });
        },
        error: () => {
            this.cargando = false;
            this.mensajeError = 'Error al obtener agenda del médico.';
        }
    });
  }

  private calcularHorasLibres(agenda: HorarioAgenda[], horasOcupadas: string[]): HorarioAgenda[] {
      const DURACION_TURNO_MINUTOS = 30; // 🛑 AJUSTAR: El valor real de tu sistema
      const turnosLibres: HorarioAgenda[] = [];

      for (const rango of agenda) {
          let horaActual = new Date(`2000/01/01 ${rango.hora_entrada}`);
          const horaFin = new Date(`2000/01/01 ${rango.hora_salida}`);
          
          while (horaActual < horaFin) {
              const horaInicioStr = this.formatearHora(horaActual);
              
              // Verificar si la hora no está ocupada
              if (!horasOcupadas.includes(horaInicioStr)) {
                  // Creamos un objeto similar a HorarioAgenda para representar la hora LIBRE
                  turnosLibres.push({
                      id: rango.id, // Usamos el ID de la agenda
                      hora_entrada: horaInicioStr,
                      hora_salida: this.formatearHora(new Date(horaActual.getTime() + DURACION_TURNO_MINUTOS * 60000)),
                      fecha: rango.fecha,
                      id_medico: rango.id_medico,
                      id_especialidad: rango.id_especialidad
                  } as HorarioAgenda);
              }
              
              // Avanzar al próximo intervalo de turno
              horaActual = new Date(horaActual.getTime() + DURACION_TURNO_MINUTOS * 60000);
          }
      }
      return turnosLibres;
  }

  private formatearHora(date: Date): string {
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
  }


  seleccionarTurno(turno: HorarioAgenda): void {
    this.turnoSeleccionado = turno;
    this.pasoActual = 3; // Avanzar a Confirmación
  }

  
  //PASO 3: Confirmación y Asignación Final


  confirmarAsignacion(): void {
    if (!this.pacienteSeleccionado || !this.turnoSeleccionado) {
      this.mensajeError = 'Faltan datos de paciente o turno.';
      return;
    }

    this.cargando = true;

    const dataTurno = {
      id_paciente: this.pacienteSeleccionado.id,
      id_agenda: this.turnoSeleccionado.id, // Es el ID del rango horario (agenda)
      fecha: this.turnoSeleccionado.fecha,
      hora: this.turnoSeleccionado.hora_entrada, // Usamos la hora de inicio del rango
      nota: this.formularioAsignar.get('nota')?.value || 'Asignado por Operador',
      id_cobertura: this.pacienteSeleccionado.id_cobertura
    };
    
    // 🛑 Endpoint requerido: POST /api/asignar-turno
    this.medicoOperadorService.asignarTurno(dataTurno).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 200) {
          alert('Turno asignado con éxito! El paciente recibirá una notificación.');
          this.router.navigate(['/operador/agenda']); 
        } else {
          this.mensajeError = res.mensaje;
          alert(`Error al asignar turno: ${res.mensaje}`);
        }
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'Error de conexión al asignar el turno.';
        alert('Error de conexión con el servidor.');
      }
    });
  }

  // --- NAVEGACIÓN ---
  volverAPaso(paso: number): void {
    if (this.pasoActual > 1) {
      this.pasoActual = paso;
      this.mensajeError = '';
    }
  }

  cancelar(): void {
    this.router.navigate(['/operador/agenda']);
  }
}