import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutModule } from '@angular/cdk/layout';

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
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    LayoutModule
  ]
})
export class MedicoModule { }
