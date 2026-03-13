// src/app/components/header/header.component.ts (VERSION SIMPLIFICADA)

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginPopupComponent } from '../../modules/auth/components/login-popup/login-popup.component';
import { AuthService } from '../../modules/auth/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  sesionIniciada$: Observable<boolean>;
  menuAbierto = false; 
  
  constructor(
    private dialogo: MatDialog, 
    private servicioAuth: AuthService, 
    private enrutador: Router,
    private router: Router
  ) {
    this.sesionIniciada$ = this.servicioAuth.sesionIniciada$;
  }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  // Métodos de acceso para el HTML
  obtenerNombreUsuario(): string | null {
    return this.servicioAuth.obtenerNombreCompleto();
  }

  obtenerRolUsuario(): string | null {
    return this.servicioAuth.obtenerRolUsuario();
  }

  abrirLogin(): void {
    const dialogRef = this.dialogo.open(LoginPopupComponent, {
      width: '400px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(resultado => {
      const rolUsuario = resultado; 
      if (rolUsuario === 'administrador') {
        this.router.navigate(['/admin']); 
      } 
      else if (rolUsuario === 'medico') {
        this.router.navigate(['/medico']); 
      }
      else if (rolUsuario === 'operador') {
        this.router.navigate(['/operador']); 
      }
    });
  }

  irAHome(){
    const rolUsuario = localStorage.getItem('rol_usuario');
    if (rolUsuario === 'administrador') {
        this.router.navigate(['/admin']); 
      } 
      else if (rolUsuario === 'medico') {
        this.router.navigate(['/medico']); 
      }
      else if (rolUsuario === 'operador') {
        this.router.navigate(['/operador']); 
      }
      else if (rolUsuario === 'paciente') {
        this.router.navigate(['/paciente']); 
      }
      else {
        this.router.navigate(['/']); 
      }
  }

  cerrarSesion(): void {
    this.servicioAuth.cerrarSesion();
    this.enrutador.navigate(['/']);
  }
}