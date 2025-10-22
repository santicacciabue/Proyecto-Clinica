// src/app/modules/operador/operador-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperadorLayoutComponent } from './operador-layout/operador-layout.component';
import { GestionAgendaComponent } from './gestion-agenda/gestion-agenda.component';
import { DetalleMedicoAgendaComponent } from './detalle-medico-agenda/detalle-medico-agenda.component';
import { CrearPacienteComponent } from './crear-paciente/crear-paciente.component';
import { AsignarTurnoComponent } from './asignar-turno/asignar-turno.component';

const routes: Routes = [
    {
        path: '', 
        component: OperadorLayoutComponent, 
        children: [
          
            { path: '', redirectTo: 'agenda', pathMatch: 'full' }, 
            
           // 1. GESTIÓN DE AGENDA (Pantalla principal)
            { path: 'agenda', component: GestionAgendaComponent, title: 'Agenda de Médicos' },
            { path: 'agenda/:id_medico', component: DetalleMedicoAgendaComponent, title: 'Agenda Detallada' },
            
            // 2. CREAR PACIENTE
            { path: 'pacientes/crear', component: CrearPacienteComponent, title: 'Crear Paciente' },
            
            // 3. ASIGNAR TURNO
            // Usaremos una ruta base, el componente se encargará de seleccionar médico, etc.
            { path: 'turnos/asignar', component: AsignarTurnoComponent, title: 'Asignar Turno' },
            
            // Aquí irán las rutas para crear pacientes, etc.
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OperadorRoutingModule { }