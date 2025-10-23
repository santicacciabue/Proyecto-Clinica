// src/app/modules/auth/components/register/register.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ruta al servicio
import Swal from 'sweetalert2';

interface Cobertura { // Definimos qué esperamos recibir del Back-end para las obras sociales
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // 1. VARIABLES DEL COMPONENTE
  formularioRegistro: FormGroup; // La instancia del formulario reactivo
  obrasSociales: Cobertura[] = []; // Array para guardar las opciones del select
  
  ocultarPassword = true; 
  ocultarConfirmacion = true; 

  constructor(
    private constructorFormulario: FormBuilder, // Inyectamos para crear el formulario
    private enrutador: Router, // Inyectamos para la navegación (redirigir al inicio)
    private servicioAuth: AuthService // Inyectamos el servicio para hacer llamadas HTTP
  ) {
    // 2. INICIALIZACIÓN DEL FORMULARIO
    // Definimos el grupo de campos y sus validadores (obligatorio, email, patrón DNI, etc.)
    this.formularioRegistro = this.constructorFormulario.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]], 
      email: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      id_cobertura: [null, Validators.required], 
      telefono: ['', Validators.required], 
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', Validators.required], 
    });
  }

  ngOnInit(): void {
    // 3. Lógica que se ejecuta al iniciar el componente
    this.cargarObrasSociales(); 
  }

    // 4. MÉTODO PARA OBTENER DATOS DEL BACK-END
  cargarObrasSociales(): void {
      // Llama al servicio (GET /api/coberturas)
      this.servicioAuth.obtenerCoberturas().subscribe({
        next: (datos) => {
          // Si todo sale bien, guardamos la data en la variable para mostrarla en el HTML
          this.obrasSociales = datos;
        },
        error: (errorCarga) => {
          // Si hay un error de conexión o en el Back-end
          console.error('Error al cargar las Obras Sociales:', errorCarga);
          Swal.fire('Error', 'No se pudo obtener la lista de obras sociales. Intente más tarde.','error');
          
        }
      });
  }
  // ... (El resto de los métodos va a continuación)
  // 5. MÉTODO PARA ENVIAR EL FORMULARIO
  enviarRegistro(): void { 
      // Primer filtro: si Angular detecta un validador que falló
      if (this.formularioRegistro.invalid) {
        Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente.','warning');
        return; 
      }

      // Segundo filtro: Validar que las contraseñas coincidan
      const password = this.formularioRegistro.get('password')?.value;
      const confirmacion = this.formularioRegistro.get('repeatPassword')?.value;
      
      if (password !== confirmacion) {
          Swal.fire('Error', 'Las contraseñas ingresadas no coinciden.','warning');
          return;
      }
      
      // 6. Preparación de los Datos
      const datosParaEnvio = { ...this.formularioRegistro.value };
      // Eliminamos el campo de repetición que solo usamos para el Front-end
      delete datosParaEnvio.repeatPassword; 

      // 7. Llamada al Servicio (POST /api/auth/register)
      this.servicioAuth.registrarPaciente(datosParaEnvio).subscribe({
        next: (respuesta) => {
          // Éxito:
          Swal.fire('Exito','¡Registro exitoso! Ya puedes iniciar sesión.','success');
          this.enrutador.navigate(['/']); // Redirige al Home
        },
        error: (errorRegistro) => {
          // Error (ej. DNI/Email ya existe, error del servidor):
          const mensajeError = errorRegistro.error?.message || 'Error desconocido al intentar registrar.';
          Swal.fire('Error', `Falló el registro: ${mensajeError}`, 'error');
          console.error('Error completo:', errorRegistro);
        }
      });
  }

  // 8. MÉTODO DE CANCELACIÓN
  volverAInicio(): void { 
      this.enrutador.navigate(['/']); 
  }
}