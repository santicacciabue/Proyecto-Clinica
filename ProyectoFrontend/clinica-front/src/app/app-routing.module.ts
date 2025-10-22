import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';

const routes: Routes = [
  
  { path: '', component: BienvenidaComponent },
  { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)},
  
  { path: 'paciente', loadChildren: () => import('./modules/paciente/paciente.module').then(m => m.PacienteModule) },
  
  { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
  
  { path: 'medico', loadChildren: () => import('./modules/medico/medico.module').then(m => m.MedicoModule)},
  
  { path: 'operador', loadChildren: () => import('./modules/operador/operador.module').then(m => m.OperadorModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
