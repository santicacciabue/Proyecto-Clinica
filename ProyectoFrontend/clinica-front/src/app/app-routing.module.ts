import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { AuthGuard } from './modules/auth/guards/auth.guard'; // 👈 Asegúrate de que esta ruta sea correcta

const routes: Routes = [
    

    { path: '', component: BienvenidaComponent },
    
    { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)},
    
    { 
        path: 'paciente', 
        loadChildren: () => import('./modules/paciente/paciente.module').then(m => m.PacienteModule),
        canLoad: [AuthGuard] // 👈 Previene la carga del módulo si no hay token (mejor para Lazy Loading)
    },
    
    { 
        path: 'admin', 
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
        canLoad: [AuthGuard] 
    },
    
    { 
        path: 'medico', 
        loadChildren: () => import('./modules/medico/medico.module').then(m => m.MedicoModule),
        canLoad: [AuthGuard] 
    },
    
    { 
        path: 'operador', 
        loadChildren: () => import('./modules/operador/operador.module').then(m => m.OperadorModule),
        canLoad: [AuthGuard] 
    },
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }