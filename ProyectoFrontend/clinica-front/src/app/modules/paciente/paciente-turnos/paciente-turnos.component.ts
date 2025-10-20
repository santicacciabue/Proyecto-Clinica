// src/app/modules/paciente/paciente-turnos/paciente-turnos.component.ts

import { Component, OnInit } from '@angular/core';
import { ClinicaService } from 'src/app/services/clinica.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
// Importaciones de RxJS necesarias para la carga segura
import { Observable, EMPTY, switchMap, filter, take, of } from 'rxjs'; 
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mis-turnos',
  templateUrl: './paciente-turnos.component.html',
  styleUrls: ['./paciente-turnos.component.css']
})
export class PacienteTurnosComponent implements OnInit {

  // Asignamos EMPTY al inicio
  turnos$: Observable<any[]> = EMPTY;
  turnoSeleccionado: any | null = null;
  idPaciente: number | null = null;

  constructor(
    private clinicaService: ClinicaService,
    private authService: AuthService,
    private router: Router, 
  ) { }

  ngOnInit(): void {
    // Patrón robusto: Cargar turnos solo cuando la sesión esté activa y los datos listos.
    this.authService.sesionIniciada$.pipe(
      // 1. Espera a que la sesión se establezca como TRUE.
      filter(estaLogueado => estaLogueado),
      // 2. Solo necesitamos que se ejecute una vez después del login/carga inicial.
      take(1), 
      // 3. Obtiene el ID del paciente y cambia el flujo al Observable de turnos.
      switchMap(() => {
        const datosUsuario = this.authService.obtenerDatosUsuario();
        
        if (datosUsuario && datosUsuario.id) {  
          this.idPaciente = datosUsuario.id;
          // Llama al servicio que devuelve el Observable de turnos
          return this.clinicaService.obtenerTurnosPaciente(this.idPaciente!);
        } else {
          // Si no hay ID, loguea el error y detiene el flujo del switchMap
          console.error('No se pudo obtener el ID del paciente logueado (Carga segura fallida).');
          return EMPTY; 
        }
      })
    ).subscribe({
      next: (turnos: any[]) => {
        // Asigna el array de turnos (envuelto en 'of') al Observable para la plantilla
        this.turnos$ = of(turnos); 
      },
      error: (err) => {
        console.error('Error al cargar turnos del paciente:', err);
        this.turnos$ = of([]); // Asigna un array vacío en caso de error
      }
    });
  }


  irAlHome(): void {
        this.router.navigate(['/']);
    }

  /**
   * Muestra u oculta la información detallada del turno al hacer clic.
   * @param turno El objeto del turno seleccionado
   */
  mostrarDetalle(turno: any): void {
    if (this.turnoSeleccionado === turno) {
      this.turnoSeleccionado = null; // Ocultar si ya está seleccionado
    } else {
      this.turnoSeleccionado = turno; // Mostrar el nuevo turno
    }
  }

  formatearFecha(fecha: string, hora?: string, formatoCompleto: boolean = false): string {
    
    // Si el string crudo no existe o es demasiado corto, devolvemos un fallback seguro
    if (!fecha || fecha.length < 5) {
        return 'Fecha no válida';
    }

    // --- LÓGICA SIMPLIFICADA PARA EL FORMATO CORTO (SWEETALERT / TÍTULO) ---
    if (!formatoCompleto) {
        
        // Asumimos que la fecha cruda tiene formato AAAA-MM-DD o DD/MM/AAAA.
        // Si el formato es 'AAAA-MM-DD' (lo que el DatePipe espera de una API REST):
        if (fecha.includes('-') && fecha.split('-').length === 3) {
            const [year, month, day] = fecha.split('-');
            // Eliminamos cualquier basura que pueda haber quedado en el día (ej: '16T03:00:00.000Z')
            const cleanedDay = day.split('T')[0];
            return `${cleanedDay}/${month}/${year}`; // -> DD/MM/AAAA
        } 
        
        // Si el formato es 'DD/MM/AAAA' o el formato raro que ves:
        if (fecha.includes('/')) {
             // Limpia el string de cualquier hora extra que esté antes de la primera barra
             const cleanedPart = fecha.split('/')[0].split('T')[0];
             const partes = fecha.split('/');
             
             if (partes.length === 3) {
                 // Devolvemos la parte limpia (Día) + Mes + Año.
                 return `${cleanedPart}/${partes[1]}/${partes[2]}`;
             }
        }
        
        // Fallback final
        return fecha.split('T')[0]; // Devolvemos solo la fecha cruda limpia de la hora
    } 

    // --- LÓGICA PARA EL FORMATO COMPLETO (DETALLE - USA NEW DATE) ---
    // Usamos la lógica de new Date() solo aquí, ya que necesitamos el día de la semana.
    try {
        let fechaAjustada = fecha;
        
        // Ajustamos la fecha de DD/MM/AAAA a AAAA-MM-DD para new Date()
        if (fecha.includes('/')) {
            const partes = fecha.split('/');
            if (partes.length === 3) {
                fechaAjustada = `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
        }
        
        const fechaHoraString = `${fechaAjustada}T${hora || '00:00'}:00`;
        const fechaObj = new Date(fechaHoraString); 

        if (isNaN(fechaObj.getTime())) {
             throw new Error("Objeto Date Inválido");
        }
        
        // Formato largo (ej: Jueves, 16 de octubre de 2025)
        const opciones: Intl.DateTimeFormatOptions = {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        };
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
        return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    } catch (e) {
        // Fallback para el detalle si falla new Date
        return `Fecha del Detalle: ${fecha.split('T')[0]}`; 
    }
  }

 

  cancelarTurno(turno: any): void {
    const idTurno = turno.id_turno || turno.id;
    // Aquí puedes abrir un diálogo de confirmación (MatDialog)
    // Usaremos un 'confirm' simple por ahora para avanzar
    if (!idTurno) {
          console.error('El objeto turno no tiene un ID válido para cancelar.');
          return;
      }
    Swal.fire({
          title: '¿Estás seguro?',
          html: `Estás a punto de cancelar tu turno de **${turno.especialidad}** con el Dr. **${turno.nombre_medico} ${turno.apellido_medico}** el ${this.formatearFecha(turno.fecha)} a las ${turno.hora} hs. <br><br>Esta acción no se puede deshacer.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cancelar turno',
          cancelButtonText: 'No, mantener turno'
      }).then((result) => { 
          if (result.isConfirmed) { 
            this.clinicaService.eliminarTurnoPaciente(idTurno).subscribe({
                next: (res) => {
                    Swal.fire({
                          icon: 'success',
                          title: 'Turno Cancelado',
                          text: `El turno del ${this.formatearFecha(turno.fecha)} ha sido eliminado exitosamente.`,
                          showConfirmButton: false,
                          timer: 3000
                      });
                      
                      // Recargar la lista (para que el turno desaparezca inmediatamente)
                      this.ngOnInit(); 
                },
                error: (err) => {
                    // 4. Reemplazar 'alert' de error por SweetAlert2
                      console.error('Error al cancelar el turno:', err);
                      Swal.fire({
                          icon: 'error',
                          title: 'Error de Cancelación',
                          text: 'Hubo un problema al intentar cancelar el turno. Intente nuevamente más tarde.',
                      });
                }
 
            });
          }
        });
  }

}