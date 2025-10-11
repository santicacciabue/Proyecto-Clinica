

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../modules/auth/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginPopupComponent } from 'src/app/modules/auth/components/login-popup/login-popup.component';

@Component({
  selector: 'app-home',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css']
})
export class BienvenidaComponent implements OnInit {

  sesionIniciada: Observable<boolean>; 
  rolUsuario: string | null = null;

  constructor(
    private servicioAuth: AuthService,
    private enrutador: Router,
    private dialogo: MatDialog
  ) {
    this.sesionIniciada = this.servicioAuth.sesionIniciada$;
  }

  ngOnInit(): void {
    // Nos suscribimos al estado para obtener el rol, aunque el *ngIf usará la pipe async
    this.sesionIniciada.subscribe(isLoggedIn => {
        if (isLoggedIn) {
            this.rolUsuario = this.servicioAuth.obtenerRolUsuario();
        } else {
            this.rolUsuario = null;
        }
    });
  }

   abrirLogin(): void {
    const dialogRef = this.dialogo.open(LoginPopupComponent, {
      width: '400px',
      autoFocus: false
    });
    // Si el login es exitoso, redirigimos al home
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.enrutador.navigate(['/']); 
      }
    });
  }

  // Opcional: Métodos para navegar (solo para claridad)
  navegar(ruta: string): void {
    this.enrutador.navigate([ruta]);
  }
}