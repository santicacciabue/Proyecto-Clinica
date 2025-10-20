

import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip'; // Para el ícono 'info' en el header
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [
    MatToolbarModule, MatIconModule, MatButtonModule, MatInputModule, 
    MatFormFieldModule, MatDialogModule, MatSelectModule, MatCardModule,
    MatTooltipModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatTableModule
  ],
  exports: [
    MatToolbarModule, MatIconModule, MatButtonModule, MatInputModule, 
    MatFormFieldModule, MatDialogModule, MatSelectModule, MatCardModule,
    MatTooltipModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatTableModule
  ]
})
export class MaterialModule { }