import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginPopupComponent } from './components/login-popup/login-popup.component';
import { RegisterComponent } from './components/register/register.component';
import { CompartidoModule } from '../../components/compartido.module';
import { ReactiveFormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AuthComponent,
    LoginPopupComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule, 
    CompartidoModule,
    HttpClientModule,
  ]
})
export class AuthModule { }
