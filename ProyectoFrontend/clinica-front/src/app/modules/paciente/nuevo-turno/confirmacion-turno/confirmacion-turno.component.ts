import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../nuevo-turno.component';

@Component({
  selector: 'app-confirmacion-turno',
  templateUrl: './confirmacion-turno.component.html',
  styleUrls: ['./confirmacion-turno.component.css']
})
export class ConfirmacionTurnoComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmacionTurnoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData // Inyecta los datos pasados
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }

}
