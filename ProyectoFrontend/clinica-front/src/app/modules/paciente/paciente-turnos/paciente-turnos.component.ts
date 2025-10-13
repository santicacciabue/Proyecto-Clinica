// src/app/modules/paciente/paciente-turnos/paciente-turnos.component.ts

import { Component, OnInit } from '@angular/core';
import { ClinicaService } from 'src/app/services/clinica.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
// Importaciones de RxJS necesarias para la carga segura
import { Observable, EMPTY, switchMap, filter, take, of } from 'rxjs'; 

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
    private authService: AuthService
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

  /**
   * Formatea la fecha completa (Requerimiento: "Lunes 30 de septiembre...")
   * @param fecha Fecha en formato YYYY-MM-DD
   * @param hora Hora en formato HH:MM
   * @returns String con la fecha y hora detallada
   */
  formatearFechaCompleta(fecha: string, hora: string): string {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    };
    
    // Crear objeto Date y formatear
    const fechaObj = new Date(`${fecha}T${hora}:00`);
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
    
    // Capitalizar la primera letra del día
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  }
}