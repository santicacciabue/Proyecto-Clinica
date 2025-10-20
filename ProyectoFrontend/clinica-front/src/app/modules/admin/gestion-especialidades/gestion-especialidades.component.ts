// src/app/modules/admin/gestion-especialidades/gestion-especialidades.component.ts

import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface Especialidad {
  id: number;
  descripcion: string;
}

@Component({
  selector: 'app-gestion-especialidades',
  templateUrl: './gestion-especialidades.component.html',
  styleUrls: ['./gestion-especialidades.component.css']
})
export class GestionEspecialidadesComponent implements OnInit {

  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  dataSource = new MatTableDataSource<Especialidad>([]);
  cargando = true;
  listaCoberturas: any[] = [];

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarCoberturasDisponibles();
  }

  cargarCoberturasDisponibles(): void {
      this.adminService.obtenerTodasCoberturas().subscribe(res => {
          this.listaCoberturas = res.payload || res; // Ajustar según cómo devuelva la lista
      });
  }


  cargarEspecialidades(): void {
    this.cargando = true;
    this.adminService.obtenerTodasEspecialidades().subscribe({
      next: (res) => {
        if (res.codigo === 200) {
          this.dataSource.data = res.payload;
        } else {
          Swal.fire('Error', res.mensaje || 'Error al cargar especialidades.', 'error');
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
  // Lógica de AGREGAR (Idéntica a coberturas)
  async agregarEspecialidad(): Promise<void> {
    // 1. Prepara las opciones del SELECT
    const opcionesCoberturaHtml = this.listaCoberturas.map(c =>
        // Ojo: SweetAlert lo manejará como un <select multiple>, el HTML es simple.
       `<option value="${c.id}">${c.nombre}</option>`
    ).join('');
    // 2. Muestra el formulario con los dos campos
    // 2. Muestra el formulario con selección múltiple
    const { value: formValues } = await Swal.fire({
        title: 'Nueva Especialidad y Asociaciones',
        html: 
            '<label for="swal-input1" style="display: block; text-align: left; margin-top: 10px;">Descripción (Nombre):</label>' +
            '<input id="swal-input1" class="swal2-input">' +
            '<label for="swal-select1" style="display: block; text-align: left; margin-top: 10px;">Coberturas Asociadas (Ctrl/Cmd + Clic para seleccionar múltiples):</label>' +
            // Añadir 'multiple' al select 🛑
            `<select id="swal-select1" class="swal2-select" multiple>${opcionesCoberturaHtml}</select>`, 
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
            // 3. Captura los valores
            const descripcion = (document.getElementById('swal-input1') as HTMLInputElement).value.trim();
            const selectElement = (document.getElementById('swal-select1') as HTMLSelectElement);
            // Captura todos los valores seleccionados como array de strings
            const idCoberturaStrs = Array.from(selectElement.selectedOptions).map(option => option.value);
            
            if (!descripcion) {
                Swal.showValidationMessage('Debe ingresar una descripción.');
                return false;
            }
            if (idCoberturaStrs.length === 0) {
                 Swal.showValidationMessage('Debe seleccionar al menos una cobertura.');
                 return false;
            }
            
            // 4. Retorna el objeto que espera el servicio
            return { 
                descripcion: descripcion, 
                // Convertir el array de strings a array de numbers 🛑
                id_coberturas: idCoberturaStrs.map(Number) 
            };
        }
    });


   if (formValues) {
    // 5. Llama al servicio con el objeto completo
    this.adminService.crearEspecialidad(formValues).subscribe({
      next: (res) => {
        if (res.codigo === 200) {
          Swal.fire('¡Éxito!', res.mensaje, 'success');
          this.cargarEspecialidades(); 
        } else if (res.codigo === -1 && res.mensaje.includes('ya existe')) {
            // Manejo del error de unicidad que viene del backend (status 409)
            Swal.fire('Error de Duplicado', res.mensaje, 'warning');
        } else {
            Swal.fire('Error', res.mensaje || 'No se pudo crear.', 'error');
        }
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || 'Error al comunicarse con la API.';
        Swal.fire('Error', mensaje, 'error');
      }
      });
    }
}

  // Lógica de EDITAR (Idéntica a coberturas)
  async editarEspecialidad(especialidad: Especialidad): Promise<void> {
    const { value: nombreNuevo } = await Swal.fire({
      title: `Editar: ${especialidad.descripcion}`,
      input: 'text',
      inputLabel: 'Nuevo nombre',
      inputValue: especialidad.descripcion,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return '¡El nombre no puede estar vacío!';
        }
        return null;
      }
    });

    if (nombreNuevo && nombreNuevo !== especialidad.descripcion) {
      this.adminService.actualizarEspecialidad(especialidad.id, nombreNuevo).subscribe({
        next: (res) => {
          if (res.codigo === 200) {
            Swal.fire('¡Éxito!', res.mensaje, 'success');
            this.cargarEspecialidades();
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

  async asociarCobertura(especialidad: Especialidad): Promise<void> {
    // 1. Obtener las coberturas que NO están asociadas
    const resNoAsociadas = await this.adminService.obtenerCoberturasNoAsociadas(especialidad.id).toPromise();

    if (resNoAsociadas.codigo !== 200 || !resNoAsociadas.payload) {
         Swal.fire('Error', 'No se pudo obtener la lista de coberturas.', 'error');
         return;
    }

    const coberturasNoAsociadas: any[] = resNoAsociadas.payload;

    if (coberturasNoAsociadas.length === 0) {
         Swal.fire('Información', `Todas las coberturas ya están asociadas a ${especialidad.descripcion}.`, 'info');
         return;
    }

    const opcionesCoberturaHtml = coberturasNoAsociadas.map(c =>
         `<option value="${c.id}">${c.nombre}</option>`
    ).join('');

    // 2. Mostrar SweetAlert para selección múltiple
    const { value: idCoberturaStrs } = await Swal.fire({
        title: `Asociar Coberturas a ${especialidad.descripcion}`,
        html: 
            '<label for="swal-select-asociar" style="display: block; text-align: left; margin-top: 10px;">Seleccione las coberturas a añadir (Ctrl/Cmd + Clic):</label>' +
            `<select id="swal-select-asociar" class="swal2-select" multiple>${opcionesCoberturaHtml}</select>`, 
        showCancelButton: true,
        preConfirm: () => {
            const selectElement = (document.getElementById('swal-select-asociar') as HTMLSelectElement);
            return Array.from(selectElement.selectedOptions).map(option => option.value);
        }
    });

    if (idCoberturaStrs && idCoberturaStrs.length > 0) {
        const id_coberturas = idCoberturaStrs.map(Number);

        this.adminService.asociarCoberturas(especialidad.id, id_coberturas).subscribe({
            next: (res) => {
                if (res.codigo === 200) {
                    Swal.fire('¡Asociación Exitosa!', res.mensaje, 'success');
                } else {
                    Swal.fire('Error', res.mensaje || 'No se pudo asociar.', 'error');
                }
            },
            error: (err) => {
                 const mensaje = err.error?.mensaje || 'Error al comunicarse con la API.';
                 Swal.fire('Error', mensaje, 'error');
            }
        });
    }
  }

  // Lógica de ELIMINAR (Idéntica a coberturas, pero con chequeo de médicos)
  async eliminarEspecialidad(especialidad: Especialidad): Promise<void> {

    const opcionesCobertura: Record<string, string> = {};
    // Asumo que tienes una lista de coberturas asociadas a esta especialidad, 
    // pero para simplificar, usaremos todas las coberturas cargadas
    this.listaCoberturas.forEach(c => {
         opcionesCobertura[c.id] = c.nombre; 
    });
    
    // 1. Preguntar si es eliminación total o por cobertura
    const { value: tipoEliminacion } = await Swal.fire({
        title: `Eliminar ${especialidad.descripcion}`,
        input: 'radio',
        inputOptions: {
            'total': 'Eliminar la Especialidad COMPLETAMENTE (si no tiene médicos).',
            'parcial': 'Solo desasociar de una Cobertura específica.'
        },
        inputValidator: (value) => {
             if (!value) { return 'Debe seleccionar una opción de eliminación.'; }
             return null;
        },
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
    });

    if (!tipoEliminacion) return;

    let idCoberturaAEliminar: number | undefined = undefined;

    if (tipoEliminacion === 'parcial') {
      //  OBTENER SOLO LAS COBERTURAS ASOCIADAS
        const coberturasAsociadas = await this.adminService.obtenerCoberturasPorEspecialidad(especialidad.id).toPromise();
        
        const opcionesCobertura: Record<string, string> = {}; 
        
        if (coberturasAsociadas.codigo !== 200 || !coberturasAsociadas.payload || coberturasAsociadas.payload.length === 0) {
             Swal.fire('Atención', 'Esta especialidad no tiene coberturas asociadas para desasociar.', 'info');
             return;
        }

        // Crear el objeto de opciones con las coberturas asociadas
        coberturasAsociadas.payload.forEach((c: any) => { // c.id y c.nombre deben venir del backend
             opcionesCobertura[c.id] = c.nombre; 
        });
        // 2. Si es parcial, pedir la cobertura
        const { value: idCoberturaStr } = await Swal.fire({
            title: `Desasociar ${especialidad.descripcion}`,
            input: 'select',
            inputOptions: opcionesCobertura,
            inputLabel: 'Seleccione la Cobertura a desasociar',
            inputPlaceholder: 'Seleccione una...',
            showCancelButton: true,
        });

        if (!idCoberturaStr) return; // Cancelado
        idCoberturaAEliminar = Number(idCoberturaStr);
    }

    // 3. Confirmación final
    const mensajeConfirmacion = tipoEliminacion === 'total'
        ? `¿Está seguro de eliminar COMPLETAMENTE la especialidad "${especialidad.descripcion}"?`
        : `¿Seguro que desea desasociar "${especialidad.descripcion}" de la Cobertura seleccionada?`;

    const confirmacion = await Swal.fire({
        title: 'Confirme la acción',
        text: mensajeConfirmacion,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: tipoEliminacion === 'total' ? 'Sí, eliminar todo' : 'Sí, desasociar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      this.adminService.eliminarEspecialidad(especialidad.id, idCoberturaAEliminar).subscribe({
        next: (res) => {
          if (res.codigo === 200) {
            Swal.fire('Eliminada', res.mensaje, 'success');
            this.cargarEspecialidades();
          } else {
            // Usa el mensaje específico de la verificación del backend
            Swal.fire('Error', res.mensaje || 'No se pudo eliminar/desasociar.', 'error'); 
          }
        },
        error: (err) => {
          const mensaje = err.error?.mensaje || 'Error al comunicarse con la API.';
          Swal.fire('Error', mensaje, 'error');
        }
      });
    }
  }
}