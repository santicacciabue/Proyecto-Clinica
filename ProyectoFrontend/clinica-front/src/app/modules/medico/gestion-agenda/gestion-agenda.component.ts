import { Component, OnInit } from '@angular/core';
import { MedicoOperadorService } from 'src/app/services/medico-operador.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-gestion-agenda',
  templateUrl: './gestion-agenda.component.html',
  styleUrls: ['./gestion-agenda.component.css']
})
export class GestionAgendaComponent implements OnInit {

  medicoId: number | null = null;
  fechaSeleccionada: string;
  horariosCargados: any[] = [];
  nuevoRango: { 
        id_especialidad: number | null,
        hora_entrada: string, 
        hora_salida: string 
    } = { 
        id_especialidad: null, 
        hora_entrada: '', 
        hora_salida: '' 
    };

  listaEspecialidades: any[] = [];
  isLoading: boolean = false;
  tieneEspecialidadUnica: boolean = false;
  mostrarCampos: boolean = false;

  constructor(private moService: MedicoOperadorService, private authService: AuthService) {
    this.fechaSeleccionada = new Date().toISOString().substring(0, 10);
  }

  ngOnInit(): void {
    // Intentamos obtener el ID del médico desde el token
    this.medicoId = this.authService.getUserId();

    if (!this.medicoId) {
      // Si aún no está (por ejemplo la sesión se inicializa después), nos suscribimos
      const sub = this.authService.sesionIniciada$.subscribe((activo) => {
        if (activo) {
          this.medicoId = this.authService.getUserId();
          this.cargarEspecialidadYAgenda();
          sub.unsubscribe();
        }
      });
    } else {
      this.cargarEspecialidadYAgenda();
    }
  }

  // Intenta cargar la(s) especialidad(es) del médico y luego la agenda
  cargarEspecialidadYAgenda(): void {
    if (!this.medicoId) return;
    this.isLoading = true;
    this.moService.obtenerEspecialidadesMedico(this.medicoId).subscribe({
      next: (res) => {
        if (res && res.codigo === 200) {
          this.listaEspecialidades = res.payload || [];
          if (this.listaEspecialidades.length === 1) {
            // Auto-seleccionamos la única especialidad
            this.nuevoRango.id_especialidad = this.listaEspecialidades[0].id_especialidad || this.listaEspecialidades[0].id_especialidad || this.listaEspecialidades[0].id_especialidad;
            this.tieneEspecialidadUnica = true;
          } else {
            this.tieneEspecialidadUnica = false;
          }
        }
      },
      error: (err) => {
        console.error('Error obteniendo especialidades del médico:', err);
      },
      complete: () => {
        // Cargamos la agenda aún si falla obtener especialidades
        this.isLoading = false;
        this.cargarAgendaDia();
      }
    });
  }

  mostrarCamposHorario(): void {
    // Alterna la visibilidad del bloque de nuevos campos de horario
    this.mostrarCampos = !this.mostrarCampos;
    // Si abrimos el formulario y no tenemos especialidades cargadas, intentamos cargarlas
    if (this.mostrarCampos && this.listaEspecialidades.length === 0 && this.medicoId) {
      this.cargarEspecialidadYAgenda();
    }
  }

  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaSeleccionada = input.value;
    this.cargarAgendaDia();
  }

  cargarAgendaDia(): void {
    if (!this.medicoId || !this.fechaSeleccionada) return;

    this.isLoading = true;
    this.moService.obtenerAgendaHorarios(this.medicoId, this.fechaSeleccionada).subscribe({
      next: (res) => {
        if (res.codigo === 200) {
          this.horariosCargados = (res.payload || []).slice();
          // Ordenamos por hora de entrada
          this.horariosCargados.sort((a, b) => (a.hora_entrada || '').localeCompare(b.hora_entrada || ''));
        } else {
          this.horariosCargados = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar agenda:', err);
        Swal.fire('Error', 'No se pudo cargar la agenda.', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  agregarHorario(): void {
    if (!this.nuevoRango.hora_entrada || !this.nuevoRango.hora_salida) {
      Swal.fire('Atención', 'Debe seleccionar hora de entrada y salida.', 'warning');
      return;
    }
    // Convertir HH:MM o HH:MM:SS a minutos desde medianoche
    const toMinutes = (t: string) => {
      if (!t) return null;
      const parts = t.split(':').map(p => parseInt(p, 10));
      if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
      return parts[0] * 60 + parts[1];
    };

    const entradaMin = toMinutes(this.nuevoRango.hora_entrada);
    const salidaMin = toMinutes(this.nuevoRango.hora_salida);
    if (entradaMin === null || salidaMin === null) {
      Swal.fire('Atención', 'Formato de hora inválido.', 'warning');
      return;
    }
    if (entradaMin >= salidaMin) {
      Swal.fire('Atención', 'La hora de entrada debe ser anterior a la hora de salida.', 'warning');
      return;
    }

    // Chequeo de solapamiento con los rangos existentes para la misma fecha (usando minutos)
    const overlap = this.horariosCargados.some(h => {
      const eMin = toMinutes(h.hora_entrada || '');
      const sMin = toMinutes(h.hora_salida || '');
      if (eMin === null || sMin === null) return false;
      // Solapamiento si (entrada < s) && (salida > e)
      return (entradaMin < sMin) && (salidaMin > eMin);
    });
    if (overlap) {
      Swal.fire('Atención', 'El rango horario se solapa con uno ya existente para esa fecha.', 'warning');
      return;
    }

    // Validaciones requeridas por el backend
    // Si el médico no tiene una especialidad única, requerimos selección
    if (!this.tieneEspecialidadUnica && !this.nuevoRango.id_especialidad) {
      Swal.fire('Atención', 'Debe seleccionar una especialidad.', 'warning');
      return;
    }
    if (!this.fechaSeleccionada) {
      Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
      return;
    }

    this.isLoading = true;

  const data: any = {
    id_especialidad: this.nuevoRango.id_especialidad,
    fecha: this.fechaSeleccionada,
    hora_entrada: this.nuevoRango.hora_entrada,
    hora_salida: this.nuevoRango.hora_salida,
  };

  // Si tenemos medicoId en frontend lo incluimos como helper (el backend obtiene el id del token)
  if (this.medicoId) data.id_medico = this.medicoId;

    this.moService.crearMiRangoHorario(data).subscribe({
      next: (res) => {
        if (res.codigo === 200) {
          Swal.fire('¡Éxito!', 'Horario agregado correctamente.', 'success');
          this.nuevoRango = { 
                id_especialidad: null, 
                hora_entrada: '', 
                hora_salida: '' 
            };
          // Ocultamos el formulario al guardar y recargamos la agenda
          this.mostrarCampos = false;
          this.cargarAgendaDia();
        } else {
          Swal.fire('Error', res.mensaje || 'No se pudo agregar el horario.', 'error');
        }
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        // Si el backend responde con { codigo: -1, mensaje: '...' } mostrar ese mensaje
        const backendMsg = err && err.error && err.error.mensaje ? err.error.mensaje : null;
        if (backendMsg) {
          Swal.fire('Error', backendMsg, 'error');
        } else {
          Swal.fire('Error', 'Error al comunicar con el servidor.', 'error');
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  eliminarHorario(id_horario: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará el rango horario de su agenda.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.moService.eliminarRangoHorario(id_horario).subscribe({
          next: (res) => {
            if (res.codigo === 200) {
              Swal.fire('¡Eliminado!', res.mensaje, 'success');
              this.cargarAgendaDia();
            } else {
              Swal.fire('Error', res.mensaje || 'No se pudo eliminar el horario.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Error al eliminar el horario.', 'error');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }
}