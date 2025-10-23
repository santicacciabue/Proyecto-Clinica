// src/app/modules/operador/asignar-turno/asignar-turno.component.ts

import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoOperadorService } from '../../../services/medico-operador.service';
import { HorarioAgenda } from '../detalle-medico-agenda/detalle-medico-agenda.models';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import Swal from 'sweetalert2';

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
  esModal = false;
  // --- PASOS Y ESTADOS ---
  preIdMedico: number | null = null;
  preFecha: string | null = null;
  pasoActual: number = 1;
  cargando = false;
  mensajeError = '';
  busquedaRealizada: boolean = false;

  medicoPreseleccionadoNombre: string = '';
  especialidadPreseleccionadaDescripcion: string = '';

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
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AsignarTurnoComponent>
  ) {

        if (data && data.id_medico) {
            this.esModal = true;
        }
  }

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

    if (this.esModal) {
            this.checkPreseleccionesModal(this.data);
        } else {
            this.checkPreselecciones(); // Para cuando se navega directamente a /operador/turnos/asignar
        }
    if (this.preIdMedico) {
             const especialidadControl = this.formularioAsignar.get('id_especialidad');
             const medicoControl = this.formularioAsignar.get('id_medico');
             
             // Esto asegura que el formulario sea válido si tienen valores
             if (especialidadControl) {
                especialidadControl.setValidators(null);
                especialidadControl.updateValueAndValidity();
             }
             if (medicoControl) {
                medicoControl.setValidators(null);
                medicoControl.updateValueAndValidity();
             }
    }

    this.formularioAsignar.get('id_especialidad')?.valueChanges.subscribe(id_especialidad => {
        if (id_especialidad) {
            this.cargarMedicos(id_especialidad);
            this.formularioAsignar.get('id_medico')?.setValue(null); // Resetear médico al cambiar especialidad
        }
    });
  }

    checkPreseleccionesModal(data: any): void {
        this.preIdMedico = data.id_medico ? +data.id_medico : null;
        this.preFecha = data.fecha;

        if (this.preFecha) {
            this.formularioAsignar.patchValue({ fecha: this.preFecha });
        }
        this.pasoActual = 1;
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
                      Swal.fire('Información', 'No hay médicos con agenda para esta especialidad.', 'info');
                  }
              }
          },
          error: () => { 
             this.medicos = [];
             Swal.fire('Error', 'Error al cargar médicos por especialidad.', 'error');
          } 
      });
  }

  // Verificar si vinimos desde DetalleMedicoAgendaComponent
  checkPreselecciones(): void {
    this.route.queryParams.subscribe(params => {
        const idMedicoStr = params['id_medico'];
        const fechaStr = params['fecha'];

        this.preIdMedico = idMedicoStr ? +idMedicoStr : null;
        this.preFecha = fechaStr;

        if (this.preFecha) {
            this.formularioAsignar.patchValue({
                fecha: this.preFecha
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
        this.busquedaRealizada = true;
        if (res.codigo === 200) {
          this.pacientesEncontrados = res.payload || []; 
        } else {
          this.pacientesEncontrados = [];
          this.mensajeError = res.mensaje; // Muestra "Debe ingresar al menos 3 caracteres..."
        }
      },
      error: (err) => {
        this.cargando = false;
        this.busquedaRealizada = true;
        this.mensajeError = 'Error al buscar pacientes en el servidor.';  
        console.error('Error de API:', err);
      }
    });
  }

  seleccionarPaciente(paciente: PacienteBusqueda): void {
    this.pacienteSeleccionado = paciente;
    this.pasoActual = 2; 
    this.mensajeError = '';
    this.pacientesEncontrados = [];
    
    // 1. Cargar especialidades filtradas por cobertura
    this.cargarEspecialidades(paciente.id_cobertura).then(() => {
        
        // 2. Si hay un médico preseleccionado, buscamos su especialidad
        if (this.preIdMedico && this.preFecha) {
            this.formularioAsignar.patchValue({ id_medico: this.preIdMedico });
            
            this.medicoOperadorService.obtenerEspecialidadPorMedico(this.preIdMedico).subscribe((res) => {
                if (res.codigo === 200 && res.payload) {
                  console.log(res.payload);
                    const idEspecialidadMedico = res.payload[0].id_especialidad;
                    
                    // 3. Verificar si la especialidad del médico es VÁLIDA para la cobertura del paciente
                    const esEspecialidadValida = this.especialidades.some(e => e.id === idEspecialidadMedico);
                    
                    if (esEspecialidadValida) {
                        // 4. Preseleccionar y disparar la búsqueda
                        this.formularioAsignar.patchValue({
                            id_especialidad: idEspecialidadMedico 
                        });
                        this.buscarDisponibilidad();

                        this.medicoOperadorService.buscarUsuario(this.preIdMedico!).subscribe((resMedico) => {
                        if (resMedico.codigo === 200 && resMedico.payload) {
                            const medico = resMedico.payload[0];
                            // 🛑 ALMACENAR NOMBRE DEL MÉDICO
                            this.medicoPreseleccionadoNombre = `${medico.apellido}, ${medico.nombre}`;
                            // 🛑 ALMACENAR DESCRIPCIÓN DE LA ESPECIALIDAD
                            this.especialidadPreseleccionadaDescripcion = res.payload[0].descripcion;
                        }
                    });
                        
                        Swal.fire({
                            icon: 'info',
                            title: 'Preselección Exitosa',
                            text: `Médico y Especialidad (${res.payload[0].descripcion}) preseleccionados.`,
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                        });
                        
                    } else {
                        // 5. El médico no atiende esa especialidad con la cobertura del paciente
                        Swal.fire({
                            icon: 'warning',
                            title: 'Especialidad Incompatible',
                            text: `El médico preseleccionado atiende la especialidad "${res.payload[0].descripcion}", pero no está cubierta para este paciente. Seleccione una especialidad válida.`,
                            confirmButtonText: 'Entendido'
                        });
                        this.preIdMedico = null;
                    }
                }
            });
        }
    });
  }


  cargarEspecialidades(id_cobertura: number | null): Promise<void> {
    return new Promise((resolve, reject) => {
        this.especialidades = [];
        this.medicoOperadorService.obtenerEspecialidadesPorCobertura(id_cobertura).subscribe({
            next: (res) => {
                if (res.codigo === 200) {
                    this.especialidades = res.payload || [];
                    resolve();
                } else {
                    this.mensajeError = 'Error al cargar especialidades: ' + res.mensaje;
                    reject();
                }
            },
            error: () => {
                this.mensajeError = 'Error de conexión al obtener especialidades.';
                reject();
            }
        });
    });
  }

  buscarDisponibilidad(): void {
    const { fecha } = this.formularioAsignar.value;
    // if (!id_medico || !fecha) {
    //         Swal.fire('Atención', 'Seleccione Médico y Fecha.', 'warning');
    //         return;
    // }
  
    
    this.cargando = true;
    this.horariosDisponibles = [];
    this.turnoSeleccionado = null; // BORRAR ESTOOOOOOOOOOOOOO
    
    // 1. Obtener la agenda (rangos de trabajo) del médico para esa fecha
    this.medicoOperadorService.obtenerAgendaHorarios(this.preIdMedico!, fecha).subscribe({
        next: (resAgenda) => {
            if (resAgenda.codigo !== 200 || resAgenda.payload.length === 0) {
                this.cargando = false;
                Swal.fire('Información', 'El médico no tiene agenda abierta en esa fecha.', 'info');
                return;
            }
            const agenda = resAgenda.payload as HorarioAgenda[];
            
            // 2. Obtener las horas ya ocupadas (turnos confirmados)
            this.medicoOperadorService.obtenerHorasOcupadas(this.preIdMedico!, fecha).subscribe({
                next: (resOcupadas) => {
                    this.cargando = false;
                    const horasOcupadas: string[] = resOcupadas.payload.map((t: any) => t.hora); // Asumo que devuelve { hora: 'HH:MM' }
                    
                    // 3. Calcular las horas disponibles
                    this.horariosDisponibles = this.calcularHorasLibres(agenda, horasOcupadas);

                    if (this.horariosDisponibles.length === 0) {
                            Swal.fire('Información', 'No hay turnos libres para los criterios seleccionados.', 'info');
                    }
                },
                error: () => {
                    this.cargando = false;
                    this.mensajeError = 'Error al obtener horas ocupadas.';
                    Swal.fire('Error', 'Error al obtener horas ocupadas.', 'error');
                }
            });
        },
        error: () => {
            this.cargando = false;
            this.mensajeError = 'Error al obtener agenda del médico.';
            Swal.fire('Error', 'Error al obtener agenda del médico.', 'error');
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
                    Swal.fire({
                        icon: 'success',
                        title: '¡Turno Asignado!',
                        text: 'El turno se registró con éxito y el paciente ha sido notificado.',
                        confirmButtonText: 'Aceptar'
                    });
                    
                    if (this.esModal) {
                        this.dialogRef.close({ turnoAsignado: true }); // Cerrar y pasar resultado
                    } else {
                        this.router.navigate(['/operador/agenda']);
                    }
                } 
                else if (res.codigo === 3) { // MANEJO DE DUPLICADO
                  Swal.fire({
                    icon: 'error',
                    title: 'Turno Duplicado',
                    text: res.mensaje, // Muestra el mensaje del backend
                    confirmButtonText: 'Aceptar'
                  })
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al Asignar Turno',
                        text: res.mensaje,
                        confirmButtonText: 'Aceptar'
                    });
                }
            },
      error: () => {
                this.cargando = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Conexión',
                    text: 'Error de conexión con el servidor. Intente nuevamente.',
                    confirmButtonText: 'Aceptar'
                });
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
    if (this.esModal) {
            this.dialogRef.close();
        } else {
            this.router.navigate(['/operador/agenda']);
        }
  }
}