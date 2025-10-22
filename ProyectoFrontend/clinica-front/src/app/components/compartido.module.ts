// src/app/compartido.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Para que el Router funcione
import { HeaderComponent } from '../components/header/header.component'; 
import { FooterComponent } from '../components/footer/footer.component'; 
import { MaterialModule } from './material.module'; // Importa el módulo de Material
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule
     
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    RouterModule, // Exporta RouterModule y MaterialModule para que los otros módulos puedan usar la navegación y los componentes de Material
    MaterialModule,
    
  ]
})
export class CompartidoModule { }