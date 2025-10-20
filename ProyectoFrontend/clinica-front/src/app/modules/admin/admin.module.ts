import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { GestionCoberturasComponent } from './gestion-coberturas/gestion-coberturas.component';
import { CompartidoModule } from '../../components/compartido.module';
import { GestionEspecialidadesComponent } from './gestion-especialidades/gestion-especialidades.component';
import { GestionUsuariosComponent } from './gestion-usuarios/gestion-usuarios.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminComponent,
    GestionCoberturasComponent,
    GestionEspecialidadesComponent,
    GestionUsuariosComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    CompartidoModule,
    FormsModule
  ]
})
export class AdminModule { }
