// src/app/modules/paciente/paciente-datos/paciente-datos.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ClinicaService } from 'src/app/services/clinica.service';
import Swal from 'sweetalert2'; // Para mensajes lindos
import {  forkJoin, of  } from 'rxjs'; // Para carga segura
import { catchError } from 'rxjs/operators'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-datos',
  templateUrl: './paciente-datos.component.html',
  styleUrls: ['./paciente-datos.component.css']
})
export class PacienteDatosComponent implements OnInit {

  datosForm!: FormGroup; // El formulario reactivo
  coberturas: any[] = []; // Para el dropdown de coberturas
  idPaciente: number | null = null;
  datosCargados = false;
  fechaNacimientoOriginal: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clinicaService: ClinicaService,
     private router: Router
  ) { }

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarDatosIniciales();
  }
  
  irAlHome(): void {
        this.router.navigate(['/']);
    }

  // Inicializa el formulario con todos los campos del paciente
  iniciarFormulario(): void {
    this.datosForm = this.fb.group({
      nombre: [{ value: '', disabled: true }], // Solo lectura
      apellido: [{ value: '', disabled: true }], // Solo lectura
      dni: [{ value: '', disabled: true }], // Solo lectura
      fecha_nacimiento: [{ value: '', disabled: true }], // Solo lectura
      rol: [{ value: '', disabled: true }], // Solo lectura
      passwordOriginal: [{ value: '', disabled: true }], // Solo lectura
      
      //  CAMPOS EDITABLES 
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cobertura: ['', Validators.required],
      
      // La contraseña no se carga, solo se permite establecer una nueva
      nueva_contrasena: [''], 
    });
  }

  // Carga los datos del paciente y las opciones de cobertura
  cargarDatosIniciales(): void {
    // 1. Iniciar la cadena: Esperar sesión
    // 1. Obtener ID del paciente SÍNCRONAMENTE antes de iniciar el flujo
    const datosUsuario = this.authService.obtenerDatosUsuario();
    this.idPaciente = datosUsuario?.id || null;

    if (!this.idPaciente) {
        // Si no hay ID, mostramos error y terminamos
        this.datosCargados = true;
        Swal.fire('Error', 'No se pudo obtener el ID del usuario. Vuelva a iniciar sesión.', 'error');
        return; // Salida limpia y SÍNCRONA
    }
        
        // PUNTO CLAVE: Devolver el forkJoin 
        forkJoin({
          coberturas: this.clinicaService.obtenerTodasCoberturas().pipe(
              catchError(() => of([])) // Si falla coberturas, devuelve un array vacío
          ),
          datosPaciente: this.clinicaService.obtenerDatosUsuario(this.idPaciente).pipe(
              catchError(() => of(null)) // Si falla el usuario, devuelve null
          )
        }).subscribe({
        next: (results: any) => { // Asegúrate que TypeScript acepte el tipo de `results`
            // La ejecución llega aquí solo si el switchMap devolvió el forkJoin
            
            this.coberturas = results.coberturas || []; 
            
            const datos: any = results.datosPaciente;

            if (datos) {
              this.fechaNacimientoOriginal = datos.fecha_nacimiento;
              const fechaFormateada = this.formatearFecha(datos.fecha_nacimiento);
                this.datosForm.patchValue({
                    nombre: datos.nombre,
                    apellido: datos.apellido,
                    dni: datos.dni,
                    fecha_nacimiento: fechaFormateada,
                    rol: datos.rol,
                    passwordOriginal: datos.password,
                    email: datos.email,
                    telefono: datos.telefono,
                    cobertura: datos.id_cobertura, 
                });
            } else {
                Swal.fire('Error', 'No se pudieron cargar los datos personales.', 'error');
            }
            this.datosCargados = true;
        },
        error: (err) => {
            // Este error solo se activa si hay un error fatal en la cadena del pipe.
            console.error('Error fatal al cargar datos:', err);
            Swal.fire('Error', 'Error de conexión al cargar datos iniciales.', 'error');
            this.datosCargados = true;
        }
    });
  }

  //  LÓGICA DE GUARDADO DE CAMBIOS 
  guardarCambios(): void {
    if (this.datosForm.invalid) {
      Swal.fire('Atención', 'Por favor, complete correctamente todos los campos requeridos.', 'warning');
      this.datosForm.markAllAsTouched(); // Para mostrar errores
      return;
    }
    
    const formValues = this.datosForm.getRawValue();
    const nuevaContrasena = formValues.nueva_contrasena ? formValues.nueva_contrasena.trim() : '';

    let passwordAEnviar: string;

    if (nuevaContrasena.length > 0) {
        // 1. Si el usuario ingresó una nueva, se envía el nuevo valor
        passwordAEnviar = nuevaContrasena;
    } else {
        // 2. Si NO ingresó nada, se envía el hash original cargado
        passwordAEnviar = formValues.passwordOriginal; 
    }
    
     const cambios: any = {
        dni: formValues.dni,
        apellido: formValues.apellido,
        nombre: formValues.nombre,
        fecha_nacimiento: this.fechaNacimientoOriginal,
        rol: formValues.rol,
        email: formValues.email, 
        telefono: formValues.telefono,
        id_cobertura: formValues.cobertura,
        password: passwordAEnviar
    };

    
    
    

    if (!this.idPaciente) {
         Swal.fire('Error', 'ID de paciente no encontrado. No se puede guardar.', 'error');
         return;
    }

    if (this.idPaciente) {
      //  Llama al servicio que actualiza el paciente (debes crearlo en ClinicaService) 
      this.clinicaService.actualizarDatosPaciente(this.idPaciente, cambios).subscribe({
        next: (res) => {
          // 1. POP-UP DE ÉXITO REQUERIDO
          Swal.fire({
            icon: 'success',
            title: 'Cambios guardados con éxito',
            showConfirmButton: true, // Botón de aceptar que cierra el pop-up
            confirmButtonText: 'Aceptar'
          });
          
          // 2. Opcional: Limpiar el campo de contraseña después de guardar
          this.datosForm.get('nueva_contrasena')?.reset('');
        },
        error: (err) => {
          console.error('Error al guardar datos:', err);
          Swal.fire('Error', 'No se pudieron guardar los cambios. Intente nuevamente.', 'error');
        }
      });
    }
  }

  // Helper para obtener el nombre de la cobertura
  getNombreCobertura(id: number): string {
    const cobertura = this.coberturas.find(c => c.id === id);
    return cobertura ? cobertura.nombre : 'Cargando...';
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


}