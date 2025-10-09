import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { HeaderComponent } from './header/header.component'; // Lo crearemos en el siguiente paso
import { FooterComponent } from './footer/footer.component'; // Lo crearemos en el siguiente paso
import { RouterModule } from '@angular/router'; // Necesario para la navegación



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule 
  ],
  exports: [
    MaterialModule, // Exporta MaterialModule para que otros lo usen fácilmente
    HeaderComponent,
    FooterComponent
    // Aquí puedes añadir otros módulos o componentes compartidos como el LoginModal
  ]
})
export class CompartidoModule { }
