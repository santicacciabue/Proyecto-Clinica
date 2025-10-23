// src/app/modules/operador/crear-paciente/crear-paciente.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicoOperadorService, RegistroPaciente, Cobertura } from '../../../services/medico-operador.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-paciente',
  templateUrl: './crear-paciente.component.html',
  styleUrls: ['./crear-paciente.component.css']
})
export class CrearPacienteComponent implements OnInit {

  pacienteForm!: FormGroup;
  enviando = false;
  mensajeError = '';
  coberturas: Cobertura[] = [];
  cargandoCoberturas = true;

  constructor(
    private fb: FormBuilder,
    private medicoOperadorService: MedicoOperadorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pacienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]], // 7 a 9 dígitos
      fecha_nacimiento: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{8,}$/)]], // Mínimo 8 dígitos
      email: ['', [Validators.required, Validators.email]],
      // La contraseña inicial la definimos simple y temporalmente
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      id_cobertura: [null]
    });
    this.cargarCoberturas();
  }

  cargarCoberturas(): void {
    this.cargandoCoberturas = true;
    this.medicoOperadorService.obtenerCoberturas().subscribe({
      next: (res) => {
        this.cargandoCoberturas = false;
        if (res.codigo === 200) {
          this.coberturas = res.payload || [];
        } else {
          this.mensajeError = 'Error al cargar coberturas.';
        }
      },
      error: (err) => {
        this.cargandoCoberturas = false;
        this.mensajeError = 'Error de conexión al cargar coberturas.';
      }
    });
  }

  // Getter para facilitar el acceso a los controles en el HTML
  get f() { return this.pacienteForm.controls; }

  // 🛑 Envío del formulario
  onSubmit(): void {
    this.mensajeError = '';
    
    if (this.pacienteForm.invalid) {
      alert('Por favor, revise los campos marcados en rojo.');
      this.pacienteForm.markAllAsTouched();
      return;
    }

    this.enviando = true;

    // Convertir el valor del formulario al formato de la interfaz
    const pacienteData = this.pacienteForm.value;
    const dataConRol = {
      ...pacienteData,
      rol: 'paciente',
      // Aseguramos que id_cobertura sea null si el valor es null/0 o cadena vacía
      id_cobertura: pacienteData.id_cobertura ? Number(pacienteData.id_cobertura) : null
    };

    this.medicoOperadorService.registrarPaciente(dataConRol).subscribe({
      next: (res) => {
        this.enviando = false;
        if (res.codigo === 200) {
          alert(`Paciente ${pacienteData.nombre} ${pacienteData.apellido} registrado con éxito!`);
          this.pacienteForm.reset(); 
          this.pacienteForm.get('password')?.setValue('123456'); 
          this.pacienteForm.get('id_cobertura')?.setValue(null); // Resetear a null
        } else {
          this.mensajeError = res.mensaje || 'Error desconocido al registrar el paciente.';
          alert(`Error: ${this.mensajeError}`);
        }
      },
      error: (err) => {
        this.enviando = false;
        this.mensajeError = 'Error de conexión con el servidor.';
        console.error('Error de registro:', err);
        alert('Error de conexión con el servidor. Intente más tarde.');
      }
    });
  }
}