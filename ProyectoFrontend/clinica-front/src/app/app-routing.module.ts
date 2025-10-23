import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { AuthGuard } from './modules/auth/guards/auth.guard';

const routes: Routes = [
    

    { path: '', component: BienvenidaComponent },
    
    { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)},
    
    { 
        path: 'paciente', 
        loadChildren: () => import('./modules/paciente/paciente.module').then(m => m.PacienteModule),
        canLoad: [AuthGuard],
        canActivate: [AuthGuard], 
        data: { roles: ['paciente', 'admin']}
    },
    
    { 
        path: 'admin', 
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
    },
    
    { 
        path: 'medico', 
        loadChildren: () => import('./modules/medico/medico.module').then(m => m.MedicoModule),
        canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        data: { roles: ['medico', 'admin'] }
    },
    
    { 
        path: 'operador', 
        loadChildren: () => import('./modules/operador/operador.module').then(m => m.OperadorModule),
        canLoad: [AuthGuard],
        canActivate: [AuthGuard],
        data: { roles: ['operador', 'admin'] } 
    },
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }