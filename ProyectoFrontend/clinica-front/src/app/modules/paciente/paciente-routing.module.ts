// src/app/modules/paciente/paciente-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PacienteComponent } from './paciente.component'; // ¡Necesario!
import { NuevoTurnoComponent } from './nuevo-turno/nuevo-turno.component';
import { PacienteTurnosComponent } from './paciente-turnos/paciente-turnos.component';
import { PacienteDatosComponent } from './paciente-datos/paciente-datos.component';

import { AuthGuard } from '../auth/guards/auth.guard'; // Importamos el guardia funcional

const routes: Routes = [
    {
        // Ruta base: /paciente
        path: '',
        component: PacienteComponent, // Componente principal que contiene el layout (sidebar, header, etc.)
        canActivate: [AuthGuard], // PROTEGE TODAS LAS RUTAS HIJAS
        children: [
            // /paciente/nuevo-turno
            { path: 'nuevo-turno', component: NuevoTurnoComponent },

            // /paciente/mis-turnos (Usamos 'mis-turnos' para la URL, aunque el archivo se llame PacienteTurnos)
            { path: 'mis-turnos', component: PacienteTurnosComponent },

            // /paciente/mis-datos (Cambiado a 'mis-datos' para consistencia con 'mis-turnos')
            { path: 'mis-datos', component: PacienteDatosComponent },

            // Redirección al acceder solo a /paciente (redirige a mis-turnos, que es la vista principal)
            { path: '', redirectTo: 'mis-turnos', pathMatch: 'full' }, 
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacienteRoutingModule { }
