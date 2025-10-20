// src/app/modules/auth/components/login-popup/login-popup.component.ts

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 
import { Router } from '@angular/router'; // Lo necesitamos para redirigir

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css']
})
export class LoginPopupComponent {
  
  formularioLogin: FormGroup;
  ocultarPassword = true; 
  mensajeError: string = '';

  constructor(
    public referenciaDialogo: MatDialogRef<LoginPopupComponent>, // Para cerrar el pop-up
    private constructorFormulario: FormBuilder,
    private servicioAuth: AuthService, // Para iniciar sesión
    private enrutador: Router
  ) {
    this.formularioLogin = this.constructorFormulario.group({
      usuario: ['', Validators.required], // El Back-end espera este campo para DNI/Email
      password: ['', Validators.required]
    });
  }

  // Se ejecuta al hacer click en Aceptar
  procesarLogin(): void {
    this.mensajeError = ''; // Limpiamos errores anteriores
    if (this.formularioLogin.invalid) return;

    const credenciales = this.formularioLogin.value;

    this.servicioAuth.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        // Éxito: El token ya fue guardado en LocalStorage por el AuthService
        this.referenciaDialogo.close(respuesta.usuario.rol);

      },
      error: (errorLogin) => {
        // Fallo: Muestra el mensaje de error del servidor
        this.mensajeError = errorLogin.message || 'Error al conectar con el servidor.';
        console.error('Error de Inicio de Sesión:', errorLogin);
      }
    });
  }

  // Se ejecuta al hacer click en Cancelar
  cerrarDialogo(): void {
    this.referenciaDialogo.close(false); 
  }
}