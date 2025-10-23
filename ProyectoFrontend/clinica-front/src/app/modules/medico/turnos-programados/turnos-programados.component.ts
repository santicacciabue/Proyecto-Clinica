import { Component, OnInit } from '@angular/core';
import { MedicoOperadorService } from 'src/app/services/medico-operador.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-turnos-programados',
  templateUrl: './turnos-programados.component.html',
  styleUrls: ['./turnos-programados.component.css']
})
export class TurnosProgramadosComponent implements OnInit {

  fechaSeleccionada: string;
  turnos: any[] = [];
  turnoSeleccionado: any = null; // Para ver notas

  constructor(private moService: MedicoOperadorService) {
    // Inicializar con la fecha actual
    this.fechaSeleccionada = new Date().toISOString().substring(0, 10);
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaSeleccionada = input.value;
    this.cargarTurnos();
  }

  cargarTurnos(): void {
    if (!this.fechaSeleccionada) return;

    this.moService.obtenerMisTurnosProgramados(this.fechaSeleccionada).subscribe({
      next: (res) => {
        if (res.codigo === 200) {
          this.turnos = res.payload || [];
          // Ordenar por hora (asumiendo que la hora es un string comparable 'HH:MM:SS')
          this.turnos.sort((a, b) => a.hora.localeCompare(b.hora));
        } else {
          this.turnos = [];
          Swal.fire('Atención', res.mensaje || 'No se encontraron turnos.', 'warning');
        }
      },
      error: (err) => {
        console.error('Error al cargar turnos:', err);
        Swal.fire('Error', 'No se pudieron cargar los turnos.', 'error');
      }
    });
  }
  
  // Muestra las notas del turno en SweetAlert
  verNotas(turno: any): void {
    const edad = this.calcularEdad(turno.fecha_nacimiento);
    Swal.fire({
      title: `Detalle del Turno: ${turno.hora}`,
      html: `
        <p>Paciente: <strong>${turno.nombre_paciente}</strong> (${edad} años)</p>
        <p>Cobertura: <strong>${turno.cobertura}</strong></p>
        <hr>
        <h4>Notas Asociadas:</h4>
        <p style="text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${turno.nota || 'No hay notas asociadas a este turno.'}
        </p>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  public calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }
}