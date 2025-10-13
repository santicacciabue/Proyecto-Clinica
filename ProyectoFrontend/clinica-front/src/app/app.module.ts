// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Asegúrate de tener esto
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CompartidoModule } from '../app/components/compartido.module'; // Importa tu módulo compartido
import { BienvenidaComponent } from '../app/components/bienvenida/bienvenida.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    BienvenidaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CompartidoModule, 
    HttpClientModule,
  ],
  providers: [ // ACA SE REGISTRA EL INTERCEPTOR
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true // Le dice a Angular que pueden haber múltiples interceptores
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }