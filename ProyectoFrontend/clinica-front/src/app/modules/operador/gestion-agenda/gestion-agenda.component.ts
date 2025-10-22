// src/app/modules/operador/gestion-agenda/gestion-agenda.component.ts

import { Component, OnInit } from '@angular/core';
import { MedicoOperadorService } from '../../../services/medico-operador.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-agenda',
  templateUrl: './gestion-agenda.component.html',
  styleUrls: ['./gestion-agenda.component.css']
})
export class GestionAgendaComponent implements OnInit {

  // Propiedades
  fechaSeleccionada: string; // Formato YYYY-MM-DD
  medicosConAgenda: any[] = [];
  cargando = false;
  mensajeError = '';

  constructor(
    private medicoOperadorService: MedicoOperadorService,
    private router: Router
  ) { 
    // Inicializa con la fecha actual en formato YYYY-MM-DD
    this.fechaSeleccionada = this.formatearFecha(new Date());
  }

  ngOnInit(): void {
    this.cargarMedicosAgenda();
  }

  // formatear la fecha a YYYY-MM-DD
  private formatearFecha(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Mes + 1
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Lógica de carga de datos
  cargarMedicosAgenda(): void {
    this.cargando = true;
    this.mensajeError = '';
    
    // El backend espera el formato YYYY-MM-DD
    this.medicoOperadorService.obtenerMedicosConAgenda(this.fechaSeleccionada).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 200) {
          this.medicosConAgenda = res.payload || [];
        } else {
          this.mensajeError = res.mensaje || 'Error al cargar la agenda.';
          this.medicosConAgenda = [];
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = 'Error de conexión con el servidor.';
        this.medicosConAgenda = [];
        console.error(err);
      }
    });
  }

  // Manejador del cambio de fecha en el input
  onFechaChange(event: any): void {
    // Aseguramos que el valor sea YYYY-MM-DD, que es el formato estándar del input[type=date]
    this.fechaSeleccionada = event.target.value;
    this.cargarMedicosAgenda();
  }

  // Navegación a las acciones
  editarAgenda(id_medico: number): void {
    // Navega a la ruta detallada para editar la agenda de ese médico en la fecha seleccionada
    // Pasar la fecha como Query Param es útil para la pantalla de detalle
    this.router.navigate(['/operador/agenda', id_medico], { queryParams: { fecha: this.fechaSeleccionada, modo: 'editar' } });
  }

  verTurnos(id_medico: number): void {
    // Navega a la ruta detallada para ver solo los turnos
    this.router.navigate(['/operador/agenda', id_medico], { queryParams: { fecha: this.fechaSeleccionada, modo: 'ver' } });
  }
}