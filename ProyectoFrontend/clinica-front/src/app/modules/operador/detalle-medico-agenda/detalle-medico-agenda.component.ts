

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicoOperadorService } from '../../../services/medico-operador.service';
import { HorarioAgenda, Turno } from './detalle-medico-agenda.models';
import { EditarHorarioModalComponent } from '../modals/editar-horario-modal/editar-horario-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { AsignarTurnoComponent } from '../asignar-turno/asignar-turno.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-detalle-medico-agenda',
  templateUrl: './detalle-medico-agenda.component.html',
  styleUrls: ['./detalle-medico-agenda.component.css']
})
export class DetalleMedicoAgendaComponent implements OnInit {
  
  idMedico!: number;
  fechaSeleccionada!: string;
  modo: 'ver' | 'editar' = 'ver'; // 'ver' (ojo) o 'editar' (lápiz)

  medicoNombre: string = 'Cargando...'; // Para mostrar en el título
  agendaHorarios: HorarioAgenda[] = []; // RANGOS DE TRABAJO (para editar)
  turnosConfirmados: Turno[] = []; // TURNOS CON PACIENTE (para ver o editar)

  cargando = true;
  mensajeError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicoOperadorService: MedicoOperadorService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Suscribirse a los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      // 1. Obtener ID del Médico desde la URL
      const idMedicoStr = params.get('id_medico');
      this.idMedico = idMedicoStr ? +idMedicoStr : 0;
      
      // Suscribirse a los query parameters
      this.route.queryParamMap.subscribe(queryParams => {
        // 2. Obtener Fecha y Modo desde Query Params
        this.fechaSeleccionada = queryParams.get('fecha') || this.formatearFecha(new Date());
        this.modo = (queryParams.get('modo') === 'editar') ? 'editar' : 'ver';
        
        // Cargar los datos relevantes
        this.cargarDatosMedico();
      });
    });
  }

  private formatearFecha(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  cargarDatosMedico(): void {
    if (!this.idMedico || !this.fechaSeleccionada) {
      this.mensajeError = "Faltan parámetros de identificación.";
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // 1. Cargar Horarios de Agenda (Necesario en ambos modos)
    this.medicoOperadorService.obtenerAgendaHorarios(this.idMedico, this.fechaSeleccionada).subscribe({
      next: (resAgenda) => {
        this.cargando = false;
        if (resAgenda.codigo === 200) {
          this.agendaHorarios = resAgenda.payload || [];
          
          // Suponiendo que tienes un servicio para obtener el nombre del médico por ID
          // Si no, puedes dejar el nombre en 'Cargando...' o pasarlo como query param.
          this.medicoNombre = `Médico ID ${this.idMedico}`; 

          // 2. Si estamos en modo 'ver' o 'editar', cargamos también los turnos
          this.cargarTurnosConfirmados();

        } else {
          this.mensajeError = resAgenda.mensaje || 'Error al cargar la agenda de horarios.';
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = 'Error de conexión con el servidor.';
        console.error(err);
      }
    });
  }
  
  cargarTurnosConfirmados(): void {
  // Aseguramos que tenemos el ID y la fecha
  if (!this.idMedico || !this.fechaSeleccionada) return;

  this.medicoOperadorService.obtenerTurnosMedicoOperador(this.idMedico, this.fechaSeleccionada).subscribe({
      next: (resTurnos) => {
          if (resTurnos.codigo === 200) {
              this.turnosConfirmados = resTurnos.payload || [];
              if (this.turnosConfirmados.length > 0) {
                 this.medicoNombre = this.turnosConfirmados[0].nombre_medico; 
              } 

          } else {
              // Si el código no es 200 (error o no hay turnos)
              console.warn("No se pudieron cargar los turnos:", resTurnos.mensaje);
              this.turnosConfirmados = [];
          }
      },
      error: (err) => {
          console.error("Error al obtener turnos del médico:", err);
          // Si es un error de conexión, es mejor no borrar la agenda que ya cargó
          this.turnosConfirmados = []; 
      }
    });
  }
  
  volver(): void {
    this.router.navigate(['/operador/agenda']);
  }

  // Métodos de Acción (Editar/Cancelar/Asignar)
  
  // LÓGICA DE EDICIÓN DE AGENDA (modo editar)
  modificarRangoHorario(horario: HorarioAgenda): void {
    //  Abrir el diálogo y pasarle el objeto de horario
    const dialogRef = this.dialog.open(EditarHorarioModalComponent, {
      width: '400px',
      data: horario // Pasar el objeto HorarioAgenda
    });

    //  Suscribirse al cierre del diálogo
    dialogRef.afterClosed().subscribe((resultado: HorarioAgenda | null) => {
      // Si el resultado no es nulo (es decir, si el operador hizo clic en "Guardar")
      if (resultado) {
        this.procesarEdicionHorario(resultado);
      }
    });
  }

  private procesarEdicionHorario(horarioActualizado: HorarioAgenda): void {
    this.medicoOperadorService.modificarRangoHorario(horarioActualizado).subscribe({
        next: (res) => {
            if (res.codigo === 200) {
                Swal.fire('Éxito', 'Horario modificado con éxito.', 'success'); 
                this.cargarDatosMedico();
            } else if (res.codigo === 2) {
                // 🛑 Manejo del error de conflicto de turnos (Código 2 del backend)
                 Swal.fire({
                    icon: 'error',
                    title: 'Conflicto de Turnos',
                    text: res.mensaje, // Muestra el mensaje de la validación del backend
                    confirmButtonText: 'Aceptar'
                });
            } else if (res.codigo === -1 && res.mensaje.includes("token")){
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesión Expirada',
                    text: 'Sesión expirada o no autorizada. Por favor, vuelva a iniciar sesión.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    this.router.navigate(['/login']);
                });
            } else {
                Swal.fire('Error', 'Error al modificar: ' + res.mensaje, 'error');
            }
        },
        error: (err) => {
            console.error('Error de conexión al guardar el horario.', err);
            alert('Error de conexión con el servidor. Intente nuevamente.');
        }
    });
  }


  eliminarRangoHorario(id_horario: number): void {
    Swal.fire({
        title: '¿Está seguro?',
        text: "¿Desea eliminar este rango horario? Si tiene turnos asignados, fallará.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            this.medicoOperadorService.eliminarRangoHorario(id_horario).subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        Swal.fire('Eliminado!', 'Horario eliminado correctamente.', 'success');
                        this.cargarDatosMedico();
                    } else if (res.codigo === -2) {
                        Swal.fire('Error', res.mensaje, 'error');
                    } else {
                        Swal.fire('Error', 'Error al eliminar el horario: ' + res.mensaje, 'error');
                    }
                },
                error: () => {
                     Swal.fire('Error', 'Error de conexión al eliminar el horario.', 'error');
                }
            });
        }
    });
  }

  //LÓGICA DE GESTIÓN DE TURNOS (modo editar)
  abrirAsignarTurno(): void {
    const dialogRef = this.dialog.open(AsignarTurnoComponent, {
    width: '900px', // Tamaño apropiado para el formulario
    data: { 
        id_medico: this.idMedico, 
        fecha: this.fechaSeleccionada 
    } 
    });
      dialogRef.afterClosed().subscribe(result => {
      // Si se asignó un turno, recargar la lista de turnos en la vista principal
      if (result && result.turnoAsignado) {
          this.cargarTurnosConfirmados(); 
      }
    });
  }

  editarTurno(turno: Turno): void {
    Swal.fire({
        title: 'Mover Turno',
        text: 'La edición de turno se gestiona cancelando el actual y asignando uno nuevo. ¿Desea continuar cancelando el turno?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar y reasignar',
        cancelButtonText: 'Mantener turno'
    }).then((result) => {
        if (result.isConfirmed) {
            this.cancelarTurno(turno.id_turno); // Llama a la función de cancelación
        }
    });
  }


  cancelarTurno(id_turno: number): void {
    if (!id_turno) return;
    
    Swal.fire({
        title: '¿Está seguro?',
        text: "¡El turno será cancelado y liberado! ¿Confirma la cancelación?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar turno',
        cancelButtonText: 'Mantener'
    }).then((result) => {
        if (result.isConfirmed) {
            this.medicoOperadorService.eliminarTurno(id_turno).subscribe({
                next: (res) => {
                    if (res && res.affectedRows > 0) { 
                        Swal.fire('Cancelado!', 'Turno cancelado correctamente.', 'success');
                        this.cargarTurnosConfirmados(); 
                    } else if (res && res.mensaje) {
                        Swal.fire('Error', 'Error al cancelar: ' + res.mensaje, 'error');
                    } else {
                        Swal.fire('Cancelado!', 'Turno cancelado correctamente.', 'success'); 
                        this.cargarTurnosConfirmados(); 
                    }
                },
                error: (err) => {
                    console.error("Error de conexión al cancelar el turno:", err);
                    Swal.fire('Error', 'Error de conexión con el servidor. No se pudo cancelar el turno.', 'error');
                }
            });
        }
    });
  }

  
}