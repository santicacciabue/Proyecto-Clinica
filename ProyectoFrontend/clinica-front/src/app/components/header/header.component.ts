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

  // SOLO necesitamos el Observable para el *ngIf en el HTML
  sesionIniciada$: Observable<boolean>; 
  
  constructor(
    private dialogo: MatDialog,
    private servicioAuth: AuthService, 
    private enrutador: Router
  ) {
    this.sesionIniciada$ = this.servicioAuth.sesionIniciada$;
  }

  ngOnInit(): void {
    // No necesitamos suscribirnos aquí. La pipe async en el HTML lo hace.
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
      // Si el login fue exitoso, ya no necesitas redirigir aquí.
      // El AuthService actualiza el estado y la pipe async hace el resto.
    });
  }

  cerrarSesion(): void {
    this.servicioAuth.cerrarSesion();
    this.enrutador.navigate(['/']);
  }
}