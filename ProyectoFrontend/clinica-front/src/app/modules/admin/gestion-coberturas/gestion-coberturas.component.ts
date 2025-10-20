// src/app/modules/admin/gestion-coberturas/gestion-coberturas.component.ts

import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// Interfaz para la tabla
interface Cobertura {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-gestion-coberturas',
  templateUrl: './gestion-coberturas.component.html',
  styleUrls: ['./gestion-coberturas.component.css']
})
export class GestionCoberturasComponent implements OnInit {

  // Columnas a mostrar en la tabla
  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<Cobertura>([]);
  cargando = true;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.cargarCoberturas();
  }

  cargarCoberturas(): void {
    this.cargando = true;
    this.adminService.obtenerTodasCoberturas().subscribe({
      next: (res) => {
        if (res.codigo === 200) {
          this.dataSource.data = res.payload;
        } else {
          Swal.fire('Error', res.mensaje || 'Error al cargar coberturas.', 'error');
        }
        this.cargando = false;
      },
      error: (err) => {
        Swal.fire('Error de Conexión', 'No se pudo conectar al servidor.', 'error');
        this.cargando = false;
      }
    });
  }

  goBack(): void {
      this.router.navigateByUrl('/admin');
  }

  // Lógica de AGREGAR (Crea un nuevo registro)
  async agregarCobertura(): Promise<void> {
    const { value: nombre } = await Swal.fire({
      title: 'Nueva Cobertura',
      input: 'text',
      inputLabel: 'Nombre de la Cobertura',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes escribir un nombre!';
        }
        return null;
      }
    });

    if (nombre) {
      this.adminService.crearCobertura(nombre).subscribe({
        next: (res) => {
          if (res.codigo === 200) {
           Swal.fire('Éxito', res.mensaje, 'success'); 
           this.cargarCoberturas(); 
          } else {
            Swal.fire('Error', res.mensaje || 'No se pudo crear.', 'error');
          }
        },
        error: (errorHTTP) => {
          const mensaje = errorHTTP.error?.mensaje || 'Error al comunicarse con la API.';
          Swal.fire('Error', mensaje, 'error');
        }
      });
    }
  }

  // Lógica de EDITAR (Actualiza un registro existente)
  async editarCobertura(cobertura: any): Promise<void> {
    const { value: nombreNuevo } = await Swal.fire({
        title: `Editar: ${cobertura.nombre}`,
        input: 'text',
        inputValue: cobertura.nombre,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡El nombre no puede estar vacío!';
            }
            return null;
        }
    });

    if (nombreNuevo && nombreNuevo !== cobertura.nombre) {
      this.adminService.actualizarCobertura(cobertura.id, { nombre: nombreNuevo}).subscribe({
        next: (res) => {
          if (res.codigo === 200) {
            Swal.fire('¡Éxito!', res.mensaje, 'success');
            this.cargarCoberturas();
          } else {
            Swal.fire('Error', res.mensaje || 'No se pudo actualizar.', 'error');
          }
        },
        error: () => {
          Swal.fire('Error', 'Error al comunicarse con la API.', 'error');
        }
      });
    }
  }

  // Lógica de ELIMINAR (Elimina un registro con verificación)
  async eliminarCobertura(id: number, nombre: string): Promise<void> {
    const confirmacion = await Swal.fire({
        title: `¿Está seguro de eliminar ${nombre}?`,
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      this.adminService.eliminarCobertura(id).subscribe({
        next: (res: any) => {
          if (res.codigo === 200) {
            Swal.fire('Eliminado', res.mensaje + 'Cobertura: '+ nombre, 'success');
            this.cargarCoberturas();
          } else {
            // Mensaje de error del backend por usuarios asociados
            Swal.fire('Error', res.mensaje || 'No se pudo eliminar.', 'error'); 
          }
        },
        error: (errorHTTP) => {
          // Manejo de errores 403 (Acceso) o 404 (No encontrado)
          const mensaje = errorHTTP.error?.mensaje || 'Error al eliminar la cobertura.';
          Swal.fire('Error', mensaje, 'error');
        }
      });
    }
  }

}