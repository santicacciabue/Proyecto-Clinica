import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { ServicesComponent } from './services/services/services.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
// import { AuthComponent } from './auth/auth.component';
// import { PacientesComponent } from './pacientes/pacientes.component';
// import { MedicosComponent } from './medicos/medicos.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CompartidoModule } from './components/compartido.module';

@NgModule({
  // declarations: [
  //   AppComponent,
  //   ServicesComponent,
  //   HeaderComponent,
  //   FooterComponent,
  //   AuthComponent,
  //   PacientesComponent,
  //   MedicosComponent
  // ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CompartidoModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
