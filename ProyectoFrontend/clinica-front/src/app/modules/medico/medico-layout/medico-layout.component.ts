// src/app/modules/medico/medico-layout/medico-layout.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
// Asume que tienes un AuthService. Si no, ajusta esta línea.
import { AuthService } from 'src/app/modules/auth/services/auth.service'; 

@Component({
  selector: 'app-medico-layout',
  templateUrl: './medico-layout.component.html',
  styleUrls: ['./medico-layout.component.css']
})
export class MedicoLayoutComponent {

  constructor(private router: Router, private authService: AuthService) { } // Usamos solo Router como ejemplo

  // Método para manejar el cierre de sesión
  logout(): void {

    this.authService.cerrarSesion(); 
    this.router.navigate(['']); 
  }

}