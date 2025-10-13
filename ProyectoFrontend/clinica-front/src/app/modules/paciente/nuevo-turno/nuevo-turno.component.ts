// src/app/modules/paciente/nuevo-turno/nuevo-turno.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, EMPTY, forkJoin, of } from 'rxjs'; // Añadido forkJoin y of
import { tap, switchMap, startWith, map, filter } from 'rxjs/operators';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ClinicaService } from 'src/app/services/clinica.service'; 

@Component({
  selector: 'app-nuevo-turno',
  templateUrl: './nuevo-turno.component.html',
  styleUrls: ['./nuevo-turno.component.css']
})
export class NuevoTurnoComponent implements OnInit {

  formTurno: FormGroup;
  especialidades$: Observable<any[]> = EMPTY;
  medicos$: Observable<any[]> = EMPTY;
  
  agendaOpciones: { hora: string }[] = []; // Array simple para el <mat-select>
  agendaCompleta: { hora: string, id_agenda: number }[] = []; // Array auxiliar con el id_agenda
  
  datosPaciente: any;
  fechaMinima: Date = new Date(); 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private clinicaService: ClinicaService
  ) {
    this.formTurno = this.fb.group({
      cobertura: [{ value: '', disabled: true }], 
      especialidad: ['', Validators.required],
      profesional: [{ value: '', disabled: true }, Validators.required],
      fecha: [{ value: '', disabled: true }, Validators.required],
      hora: [{ value: '', disabled: true }, Validators.required],
      notas: ['', Validators.required], 
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.configurarFlujoFormulario();
    this.configurarListeners();
  }

  cargarDatosIniciales(): void {
    this.datosPaciente = this.authService.obtenerDatosUsuario();

    const nombreCobertura = this.datosPaciente?.nombre_cobertura || 'Particular';
    // 1. OBTENEMOS EL ID DE COBERTURA REAL DEL PACIENTE
    const idCobertura = this.datosPaciente?.id_cobertura; 

    // Precargar y deshabilitar la cobertura
    this.formTurno.get('cobertura')?.setValue(nombreCobertura);

    // 2. Cargar Especialidades FILTRADAS POR COBERTURA
    if (idCobertura) {
      // ESTA ES LA LÍNEA CRÍTICA: DEBE LLAMAR A obtenerEspecialidadesPorCobertura
      this.especialidades$ = this.clinicaService.obtenerEspecialidadesPorCobertura(idCobertura).pipe(
        tap(() => this.formTurno.get('especialidad')?.enable())
      );
    } else {
        // En caso de que idCobertura sea null/undefined (p. ej. paciente 'Particular' sin ID en el JWT)
        // Puedes poner un valor por defecto, si es el caso
        console.warn('ID de Cobertura no encontrado. Usando ID 0 como fallback.');
        this.especialidades$ = this.clinicaService.obtenerEspecialidadesPorCobertura(0).pipe( 
            tap(() => this.formTurno.get('especialidad')?.enable())
        );
    }
  }

    private configurarListeners(): void {
      const especialidadControl = this.formTurno.get('especialidad');
      if (especialidadControl) {
      this.medicos$ = especialidadControl.valueChanges.pipe(
        startWith(null), 
        // Evita llamadas API con valores nulos o indefinidos
        filter(id_especialidad => !!id_especialidad),
        tap(() => {
            // Limpia y deshabilita el select de Profesional/Fecha/Hora 
            this.formTurno.get('profesional')?.setValue(null);
            this.formTurno.get('profesional')?.disable(); 
            this.formTurno.get('fecha')?.disable(); 
            this.formTurno.get('hora')?.disable(); 
        }),
        switchMap(id_especialidad => {
          // Usamos el método correcto: obtenerMedicosPorEspecialidad
          return this.clinicaService.obtenerMedicosPorEspecialidad(id_especialidad); 
        }),
        // Habilita el select de Profesional cuando los datos llegan
        tap(() => this.formTurno.get('profesional')?.enable()) 
      );
      } else {
        // Si el control de formulario no existe (lo cual no debería pasar, pero es seguro),
        // asignamos un Observable vacío.
        this.medicos$ = EMPTY; 
      }
    }

  // ----------------------------------------------------
  // LÓGICA DE FLUJO: Especialidad -> Profesional -> Fecha -> Hora
  // ----------------------------------------------------
  configurarFlujoFormulario(): void {
    const especialidadControl = this.formTurno.get('especialidad')!;
    const profesionalControl = this.formTurno.get('profesional')!;
    const fechaControl = this.formTurno.get('fecha')!;
    const horaControl = this.formTurno.get('hora')!;

    // Función de limpieza de controles posteriores
    const limpiarControles = (controles: any[]) => {
      controles.forEach(control => {
        control.disable();
        control.reset(null, { emitEvent: false });
      });
      this.agendaOpciones = []; // Limpiar las opciones de hora
      this.agendaCompleta = [];
    };
    
    // 1. Habilitar Profesional
    this.medicos$ = especialidadControl.valueChanges.pipe(
      startWith(null), 
      tap(() => limpiarControles([profesionalControl, fechaControl, horaControl])),
      switchMap(id_especialidad => {
        if (id_especialidad) {
          profesionalControl.enable();
          return this.clinicaService.obtenerMedicosPorEspecialidad(id_especialidad);
        }
        return EMPTY;
      })
    );
    
    // 2. Habilitar Fecha
    profesionalControl.valueChanges.pipe(
        startWith(null),
        tap(() => limpiarControles([fechaControl, horaControl])),
        switchMap(id_profesional => {
            if (id_profesional) {
                fechaControl.enable();
            }
            return EMPTY;
        })
    ).subscribe();
    
// 3. Cargar Agenda (Slots Disponibles)
  fechaControl.valueChanges.pipe(
      switchMap((fechaSeleccionada: Date) => {
            const id_profesional = profesionalControl.value;
            
            // --- Limpieza y Deshabilitación ---
            horaControl.disable();
            horaControl.reset(null, { emitEvent: false });
            this.agendaOpciones = []; 
            this.agendaCompleta = []; 

            if (!id_profesional || !fechaSeleccionada) {
                return EMPTY;
            }
            
            // 1. Definición de la Fecha de Referencia (YYYY-MM-DD)
            // Usamos toISOString().split('T')[0] para obtener la fecha sin hora ni Z
            const fechaString = fechaSeleccionada.toISOString().split('T')[0];

            // Combinar 1) Rangos de trabajo y 2) Turnos ocupados
            return forkJoin([
                // Asumiendo que obtenerAgenda devuelve el payload.
                this.clinicaService.obtenerAgenda(id_profesional), 
                this.clinicaService.obtenerHorasOcupadas(id_profesional, fechaString).pipe(
                    map(turnos => turnos.map(t => t.hora)) // Extraer solo las horas ocupadas (ej: ['09:00', '10:00'])
                ) 
            ]).pipe(
                map(([rangosAgenda, turnosOcupados]) => {
                    
                    // 2. FILTRO DE AGENDA: Usando el formato YYYY-MM-DD
                    const rangosDelDia = rangosAgenda.filter(r => {
                        // Aseguramos que la fecha de la agenda se formatea de forma consistente
                        if (!r.fecha || typeof r.fecha !== 'string') {
                            return false;
                        }
                        const fechaAgendaLimpia = r.fecha.split('T')[0];
                        return fechaAgendaLimpia === fechaString;
                    });
                    
                    if (rangosDelDia.length === 0) {
                        // console.warn('No hay rangos de agenda para este día.');
                        return []; 
                    }
                    
                    // 3. GENERACIÓN DE SLOTS
                    let horasDisponibles: { hora: string, id_agenda: number }[] = [];
                    const DURACION_TURNO = 60 * 60 * 1000; // 60 minutos en milisegundos

                    for (const rango of rangosDelDia) {
                        
                        let horaActual = new Date(`2000-01-01T${rango.hora_entrada}:00.000Z`).getTime();
                        const horaFin = new Date(`2000-01-01T${rango.hora_salida}:00.000Z`).getTime();
                        
                        while (horaActual < horaFin) {
                            const horaDate = new Date(horaActual);
                            
                            // Formateo a HH:MM
                            const hora = horaDate.getUTCHours().toString().padStart(2, '0');
                            const minuto = horaDate.getUTCMinutes().toString().padStart(2, '0');
                            const slot = `${hora}:${minuto}`;
                            
                            // 4. FILTRADO
                            if (!turnosOcupados.includes(slot)) {
                                horasDisponibles.push({ hora: slot, id_agenda: rango.id }); 
                            }
                            
                            // Avanzar al siguiente slot
                            horaActual += DURACION_TURNO; 
                        }
                    }
                    
                    // 5. Asignar los resultados completos al componente (IMPORTANTE)
                    this.agendaCompleta = horasDisponibles; 
                    
                    // 6. Retornar el array simple para el subscribe (el visible en el select)
                    return horasDisponibles.map(h => ({ hora: h.hora })); 
                }) // Fin del map de forkJoin
            );
        }) // Fin del switchMap
    ).subscribe((opcionesHora: { hora: string }[]) => {
        
        // Asignamos la lista simple de horas (generada y filtrada en el map)
        this.agendaOpciones = opcionesHora; 
        
        // Habilitar la hora si hay opciones
        if (this.agendaOpciones.length > 0) {
            this.formTurno.get('hora')?.enable();
        } else {
            console.log('No hay turnos disponibles para este día.');
            this.formTurno.get('hora')?.disable();
        }
    });
  }

  // Método de Aceptar (POST del turno)
  enviarTurno(): void {
    if (this.formTurno.invalid) {
      this.formTurno.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos y corrija los errores.');
      return;
    }

    const turnoData = this.formTurno.getRawValue();
    
    // 1. Buscamos el ID_AGENDA REAL usando la hora seleccionada
    const slotSeleccionado = this.agendaCompleta.find(slot => slot.hora === turnoData.hora);
    
    if (!slotSeleccionado || !this.datosPaciente?.id || !this.datosPaciente?.id_cobertura) {
        alert('Error: Faltan datos críticos del paciente o del slot seleccionado. Vuelva a loguearse.');
        return;
    }
    
    // Obtenemos los IDs REALES del paciente
    const id_paciente_real = this.datosPaciente.id; 
    const id_cobertura_real = this.datosPaciente.id_cobertura; 

    const datosParaApi = {
        nota: turnoData.notas, 
        id_agenda: slotSeleccionado.id_agenda,
        fecha: turnoData.fecha.toISOString().split('T')[0],
        hora: turnoData.hora,
        
        // USAMOS LOS IDs REALES DEL JWT
        id_cobertura: id_cobertura_real, 
        id_paciente: id_paciente_real, 
    };

    console.log('Datos enviados a la API:', datosParaApi);

    // 2. Llamada al Servicio 
    this.clinicaService.solicitarTurno(datosParaApi as any).subscribe({
      next: (res) => {
        if (res.codigo === 200) {
            this.mostrarConfirmacion(turnoData.profesional, turnoData.fecha, turnoData.hora);
        } else {
            alert(`Error al confirmar el turno: ${res.message || 'Error desconocido'}`);
        }
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error de conexión con el servidor. El turno podría estar ocupado.');
      }
    });
  }

  mostrarConfirmacion(id_profesional: number, fecha: Date, hora: string): void {
      // Deberías buscar el nombre completo en el array 'medicos$' si quieres mostrar el nombre real
      const nombreProfesional = "Profesional Asignado"; 
      const mensaje = `Turno confirmado con ${nombreProfesional} el día ${fecha.toLocaleDateString()} a las ${hora} horas.`;
      
      alert(mensaje); // Reemplazar con MatDialog
      this.cancelar(); 
  }

  cancelar(): void {
    this.router.navigate(['/']); 
  }
}