import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperadorRoutingModule } from './operador-routing.module';
import { OperadorLayoutComponent } from './operador-layout/operador-layout.component';
import { GestionAgendaComponent } from './gestion-agenda/gestion-agenda.component';
import { DetalleMedicoAgendaComponent } from './detalle-medico-agenda/detalle-medico-agenda.component';
import { AsignarTurnoComponent } from './asignar-turno/asignar-turno.component';
import { CrearPacienteComponent } from './crear-paciente/crear-paciente.component';
import { CompartidoModule } from "src/app/components/compartido.module";
import { EditarHorarioModalComponent } from './modals/editar-horario-modal/editar-horario-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    OperadorLayoutComponent,
    GestionAgendaComponent,
    DetalleMedicoAgendaComponent,
    AsignarTurnoComponent,
    CrearPacienteComponent,
    EditarHorarioModalComponent
  ],
  imports: [
    CommonModule,
    OperadorRoutingModule,
    CompartidoModule,
    FormsModule, 
    ReactiveFormsModule,
]
})
export class OperadorModule { }
