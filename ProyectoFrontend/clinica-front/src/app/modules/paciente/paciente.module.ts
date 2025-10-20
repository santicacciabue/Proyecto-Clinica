import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { CompartidoModule } from '../../components/compartido.module';

import { PacienteRoutingModule } from './paciente-routing.module';
import { PacienteComponent } from './paciente.component';
import { NuevoTurnoComponent } from './nuevo-turno/nuevo-turno.component';
import { PacienteDatosComponent } from './paciente-datos/paciente-datos.component';
import { PacienteTurnosComponent } from './paciente-turnos/paciente-turnos.component';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmacionTurnoComponent } from './nuevo-turno/confirmacion-turno/confirmacion-turno.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    PacienteComponent,
    NuevoTurnoComponent,
    PacienteDatosComponent,
    PacienteTurnosComponent,
    ConfirmacionTurnoComponent
  ],
  imports: [
    CommonModule,
    CompartidoModule,
    PacienteRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
  ]
})
export class PacienteModule { }
