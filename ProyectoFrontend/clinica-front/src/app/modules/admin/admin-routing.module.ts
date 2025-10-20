import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

import { GestionCoberturasComponent } from './gestion-coberturas/gestion-coberturas.component';
import { GestionEspecialidadesComponent } from './gestion-especialidades/gestion-especialidades.component';
import { GestionUsuariosComponent } from './gestion-usuarios/gestion-usuarios.component';


const routes: Routes = [
  { 
    path: '', // La ruta base del módulo Admin (ej: /admin)
    component: AdminComponent, 
    children: [
      // 1. Ruta para Gestión de Coberturas (ej: /admin/coberturas)
      { 
        path: 'coberturas', 
        component: GestionCoberturasComponent 
      },
      // 2. Ruta para Gestión de Especialidades (ej: /admin/especialidades)
      { 
        path: 'especialidades', 
        component: GestionEspecialidadesComponent 
      },
      { 
        path: 'usuarios', 
        component: GestionUsuariosComponent 
      },
      
      // 4. Ruta de Redirección por defecto al dashboard o a coberturas
      { 
        path: '', 
        redirectTo: 'admin', 
        pathMatch: 'full' 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
