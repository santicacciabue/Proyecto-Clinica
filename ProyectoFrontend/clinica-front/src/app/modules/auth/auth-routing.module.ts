import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { RegisterComponent } from './components/register/register.component';
import { MedicoLayoutComponent } from '../medico/medico-layout/medico-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { PacienteComponent } from '../paciente/paciente.component';
import { OperadorLayoutComponent } from '../operador/operador-layout/operador-layout.component';
import { AdminComponent } from '../admin/admin.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  { path: '', component: AuthComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
