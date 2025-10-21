import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MedicoRoutingModule } from './medico-routing.module';
import { TurnosProgramadosComponent } from './turnos-programados/turnos-programados.component';
import { GestionAgendaComponent } from './gestion-agenda/gestion-agenda.component';
import { MedicoLayoutComponent } from './medico-layout/medico-layout.component';


@NgModule({
  declarations: [
    TurnosProgramadosComponent,
    GestionAgendaComponent,
    MedicoLayoutComponent
  ],
  imports: [
    CommonModule,
    MedicoRoutingModule,
    FormsModule
  ]
})
export class MedicoModule { }
