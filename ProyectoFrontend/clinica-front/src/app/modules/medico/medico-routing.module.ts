import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurnosProgramadosComponent } from './turnos-programados/turnos-programados.component';
import { GestionAgendaComponent } from './gestion-agenda/gestion-agenda.component';
import { MedicoLayoutComponent } from './medico-layout/medico-layout.component';


const routes: Routes = [
    {
        // Ruta base para el módulo Médico (ej: /medico)
        // Puedes usar un componente layout si lo tienes, o un componente vacío con rutas hijas.
        path: '', 
        component: MedicoLayoutComponent, // Componente principal/layout si existe
        children: [
            // Ruta principal (ej: /medico)
            { path: '', redirectTo: 'turnos', pathMatch: 'full' }, 
            
            // 1. Vista de Turnos Programados
            { path: 'turnos', component: TurnosProgramadosComponent, title: 'Mis Turnos' },
            
            // 2. Vista de Gestión de Agenda
            { path: 'agenda', component: GestionAgendaComponent, title: 'Gestionar Agenda' },
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicoRoutingModule { }
