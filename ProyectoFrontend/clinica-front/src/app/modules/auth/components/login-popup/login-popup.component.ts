// src/app/modules/auth/components/login-popup/login-popup.component.ts

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 
import { Router } from '@angular/router'; // Lo necesitamos para redirigir
import Swal from 'sweetalert2';

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
    public referenciaDialogo: MatDialogRef<LoginPopupComponent>,
    private constructorFormulario: FormBuilder,
    private servicioAuth: AuthService,
  ) {
    this.formularioLogin = this.constructorFormulario.group({
      usuario: ['', Validators.required], // El Back-end espera este campo para DNI
      password: ['', Validators.required]
    });
  }

 procesarLogin(): void {
    this.mensajeError = ''; // Limpiamos errores anteriores
    if (this.formularioLogin.invalid) return;

    const credenciales = this.formularioLogin.value;

    this.servicioAuth.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        this.referenciaDialogo.close(respuesta.usuario.rol);
      },
      error: (errorLogin) => {
        const mensajeUsuario = errorLogin.message || 'Credenciales incorrectas.'; 
 
        Swal.fire({
            icon: 'error',
            title: 'Error de Acceso',
            text: mensajeUsuario,
            confirmButtonText: 'Aceptar'
        });

        this.mensajeError = mensajeUsuario; 

        this.referenciaDialogo.close(false);
        
        console.error('Error de Inicio de Sesión:', errorLogin);
      }
    });
  }

  // Se ejecuta al hacer click en Cancelar
  cerrarDialogo(): void {
    this.referenciaDialogo.close(false); 
  }
}