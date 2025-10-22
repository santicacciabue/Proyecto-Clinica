

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicoOperadorService } from '../../../services/medico-operador.service';
import { HorarioAgenda, Turno } from './detalle-medico-agenda.models';
import { EditarHorarioModalComponent } from '../modals/editar-horario-modal/editar-horario-modal.component';
import { MatDialog } from '@angular/material/dialog';


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
              } else {
                 // Si no hay turnos, cargamos el nombre del médico desde la agenda, si es posible.
                 // Como el endpoint de agenda (obtenerAgendaHorarios) no devuelve el nombre,
                 // el nombre se mantendrá en 'Médico ID X' (o necesitarías un endpoint adicional).
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
  
  // 🛑 LÓGICA DE EDICIÓN DE AGENDA (modo editar)
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
                alert('Horario modificado con éxito.'); 
                this.cargarDatosMedico();
            } else if (res.codigo === -1 && res.mensaje.includes("token")){
                alert('Sesión expirada o no autorizada. Por favor, vuelva a iniciar sesión.');
                this.router.navigate(['/login']);
            }
            else {
                alert('Error al modificar: ' + res.mensaje);
            }
        },
        error: (err) => {
            console.error('Error de conexión al guardar el horario.', err);
            alert('Error de conexión con el servidor. Intente nuevamente.');
        }
    });
  }


  eliminarRangoHorario(id_horario: number): void {
    if (confirm("¿Está seguro de eliminar este rango horario?")) {
      this.medicoOperadorService.eliminarRangoHorario(id_horario).subscribe({
        next: () => {
          alert("Horario eliminado.");
          this.cargarDatosMedico();
        },
        error: () => alert("Error al eliminar el horario.")
      });
    }
  }

  //LÓGICA DE GESTIÓN DE TURNOS (modo editar)
  abrirAsignarTurno(): void {
    // Navegar al componente de asignar turno pasando el médico y la fecha preseleccionados
    this.router.navigate(['/operador/turnos/asignar'], { 
        queryParams: { 
            id_medico: this.idMedico, 
            fecha: this.fechaSeleccionada 
        } 
    });
  }

  editarTurno(turno: Turno): void {
  alert(`Funcionalidad de Edición de Turno (Mover) en desarrollo. Cancelar el turno actual (${turno.id_turno}) y asignar uno nuevo es la opción más sencilla.`);
  
  // ⚠️ Lógica Compleja:
  // 1. Abrir un modal o navegar a una vista con preselección.
  // 2. Permitir seleccionar nueva fecha/hora.
  // 3. Recopilar los datos del turno modificado (id_agenda, fecha, hora).
  // 4. Llamar a this.medicoOperadorService.actualizarTurno(turno.id_turno, newData).
  }


  cancelarTurno(id_turno: number): void {
    // Asegúrate de que el id_turno sea válido antes de intentar cancelar
    if (!id_turno) {
      alert("Error: ID de turno inválido.");
      return;
    }
    
    if (confirm("¿Está seguro de CANCELAR este turno? Esta acción es irreversible.")) {
        this.medicoOperadorService.eliminarTurno(id_turno).subscribe({
          next: (res) => {
            // Asumiendo que tu backend devuelve un resultado si se eliminó
            if (res && res.affectedRows > 0) { 
              alert("Turno cancelado correctamente.");
              this.cargarTurnosConfirmados(); // Recargar la lista de turnos
            } else if (res && res.mensaje) {
              alert("Error al cancelar: " + res.mensaje);
            } else {
              // Asumimos éxito si la llamada no falla y no hay mensaje de error
              alert("Turno cancelado correctamente."); 
              this.cargarTurnosConfirmados(); 
            }
          },
          error: (err) => {
            console.error("Error de conexión al cancelar el turno:", err);
            alert("Error de conexión con el servidor. No se pudo cancelar el turno.");
          }
        });
      }
    }
}