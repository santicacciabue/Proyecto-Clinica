// src/app/modules/operador/modals/editar-horario-modal/editar-horario-modal.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HorarioAgenda } from '../../detalle-medico-agenda/detalle-medico-agenda.models';

@Component({
  selector: 'app-editar-horario-modal',
  templateUrl: './editar-horario-modal.component.html',
  styleUrls: ['./editar-horario-modal.component.css']
})
export class EditarHorarioModalComponent implements OnInit {

  horarioForm!: FormGroup;
  horarioOriginal: HorarioAgenda;

  constructor(
    public dialogRef: MatDialogRef<EditarHorarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HorarioAgenda,
    private fb: FormBuilder
  ) {
    this.horarioOriginal = data;
  }

  ngOnInit(): void {
    // Inicializa el formulario con los datos del horario
    this.horarioForm = this.fb.group({
      hora_entrada: [this.horarioOriginal.hora_entrada, Validators.required],
      hora_salida: [this.horarioOriginal.hora_salida, Validators.required]
      // Nota: Los validadores complejos (hora_salida > hora_entrada) deben ser customizados
    });
  }

  guardar(): void {
    if (this.horarioForm.invalid) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    // 🛑 Devuelve los datos actualizados.
    // El componente principal (DetalleMedicoAgendaComponent) será el encargado de llamar al servicio de API.
    this.dialogRef.close({
      ...this.horarioOriginal, // Mantiene el ID y otros campos
      ...this.horarioForm.value // Sobrescribe hora_entrada y hora_salida
    } as HorarioAgenda);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}