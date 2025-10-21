// src/app/app.module.ts

import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Asegúrate de tener esto
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CompartidoModule } from '../app/components/compartido.module'; // Importa tu módulo compartido
import { BienvenidaComponent } from '../app/components/bienvenida/bienvenida.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { DatePipe } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';



@NgModule({
  declarations: [
    AppComponent,
    BienvenidaComponent,
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
    },
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Registrar locale español (usa 'es' o 'es-AR' según prefieras)
registerLocaleData(localeEs);