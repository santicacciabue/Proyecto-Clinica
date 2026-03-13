// src/app/modules/medico/medico-layout/medico-layout.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/modules/auth/services/auth.service'; 

@Component({
  selector: 'app-medico-layout',
  templateUrl: './medico-layout.component.html',
  styleUrls: ['./medico-layout.component.css']
})
export class MedicoLayoutComponent {
  sidebarAbierto = false;

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarAbierto = false;
    }
  }

  constructor(private router: Router, private authService: AuthService) { } // Usamos solo Router como ejemplo

  // Método para manejar el cierre de sesión
  logout(): void {

    this.authService.cerrarSesion(); 
    this.router.navigate(['']); 
  }

}