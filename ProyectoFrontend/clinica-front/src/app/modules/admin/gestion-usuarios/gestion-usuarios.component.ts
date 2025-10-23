import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService } from 'src/app/services/admin.service';
import { Usuario } from '../../../interfaces/Usuario.interface';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css']
})
export class GestionUsuariosComponent implements OnInit {

  displayedColumns: string[] = ['id', 'dni', 'nombre', 'apellido', 'rol', 'email', 'especialidad', 'acciones'];
  dataSource: MatTableDataSource<Usuario> = new MatTableDataSource<Usuario>();
  listaUsuarios: Usuario[] = [];
  isLoading: boolean = true;
  rolesDisponibles = ['administrador', 'medico', 'operador'];
  listaCoberturas: any[] = [];
  listaEspecialidades: any[] = [];

  constructor(
    private adminService: AdminService, 
    private router: Router, 
    private location: Location
  ) { }

  ngOnInit(): void {
    this.cargarDatosAdicionales();
  }

  goBack(): void {
    this.router.navigateByUrl('/admin'); 
  }

  cargarDatosAdicionales(): void {
  
    this.adminService.obtenerTodasCoberturas().subscribe(res => {
        if (res.codigo === 200) {
            this.listaCoberturas = res.payload;
        }
    });

    this.adminService.obtenerTodasEspecialidades().subscribe(res => {
      if (res.codigo === 200) {
        this.listaEspecialidades = res.payload;
        this.cargarUsuarios(); // cargar usuarios recién cuando las especialidades están listas
      }
    });
}

  cargarUsuarios(): void {
    this.isLoading = true;
    this.adminService.obtenerUsuarios().subscribe({
        next: (res) => {
            if (res.codigo === 200 && res.payload) {
                let payload = Array.isArray(res.payload) ? res.payload : [];

                // Limpieza estricta: Eliminar la metadata que no tiene ID ni ROL
                const usuariosLimpios = payload.filter((u: any) => 
                    u && typeof u === 'object' && !Array.isArray(u) && u.id && u.rol
                );
                
                this.listaUsuarios = usuariosLimpios
                .filter((u: any) => ['administrador', 'operador', 'medico'].includes(u.rol?.toLowerCase()))
                .map((u: any) => ({
                  ...u,
                  especialidad: this.listaEspecialidades?.find(
                    e => e.id === u.id_especialidad
                  )?.descripcion || 'N/A'
                }));

                this.dataSource.data = this.listaUsuarios;
            } else {
                Swal.fire('Error', res.mensaje || 'No se pudo cargar la lista de usuarios.', 'error');
                this.dataSource.data = [];
            }
            this.isLoading = false;
            console.log('Usuarios cargados:', this.listaUsuarios);
        },
        error: (err) => {
            const mensaje = err.error?.mensaje || 'Error al comunicarse con la API.';
            Swal.fire('Error', mensaje, 'error');
            this.dataSource.data = [];
            this.isLoading = false;
            // IMPORTANTE: Asegúrate de que el backend está ejecutando el catch para devolver un error HTTP 500
        }
    });
  }

  // --- FILTRADO (Ya implementado, pero requiere dataSource y listaUsuarios) ---
  filtroNombreApellido: string = '';
  filtroRol: string = '';

  applyFilter(): void {
    const nombreApellidoInput = this.filtroNombreApellido.trim().toLowerCase();
    const rol = this.filtroRol;

    const getSafeString = (data: any, prop: string): string => {
      const value = data[prop];
      return (value && typeof value === 'string') ? value.toLowerCase() : '';
    };

    this.dataSource.data = this.listaUsuarios.filter((data: any) => {
      const userRol = getSafeString(data, 'rol');
      const nombre = getSafeString(data, 'nombre');
      const apellido = getSafeString(data, 'apellido');
      const dni = getSafeString(data, 'dni');

      const searchTerms = nombreApellidoInput.split(' ').filter(t => t.length > 0);
      const matchesNombreApellido = searchTerms.length === 0 || searchTerms.every(term =>
        nombre.includes(term) || apellido.includes(term) || dni.includes(term)
      );
      const matchesRol = rol === '' || userRol === rol.toLowerCase();

      return matchesNombreApellido && matchesRol;
    });
  }

  verificarROl(){

  }

  async crearUsuario(): Promise<void> {
    // Implementación detallada a continuación
    await this.mostrarFormularioUsuario();
  }

  async editarUsuario(usuario: Usuario): Promise<void> {
    // Implementación detallada a continuación
    await this.mostrarFormularioUsuario(usuario);
  }

  // --- Formulario Único para Crear y Editar ---
  private async mostrarFormularioUsuario(usuarioAEditar?: Usuario): Promise<void> {
    const title = usuarioAEditar ? `Editar Usuario: ${usuarioAEditar.nombre} ${usuarioAEditar.apellido}` : 'Nuevo Usuario Administrativo';
    
        const especialidadSelect = `
          <select id="swal-especialidad" class="swal2-select">
            <option value="null">-- Sin Especialidad (Si no es médico) --</option>
            ${this.listaEspecialidades.map(e => 
                `<option value="${e.id}" ${usuarioAEditar?.id_especialidad === e.id ? 'selected' : ''}>
                    ${e.descripcion}
                </option>` 
            ).join('')}
          </select>
        `;

    // 3. Construcción del HTML
    //  CORRECCIÓN: Para mostrar el select de especialidad en "Editar", usamos el rol de usuarioAEditar.
    //   En "Crear", SweetAlert no puede saber el rol hasta que el usuario lo selecciona (requiere JS adicional, que omitimos por simplicidad de SweetAlert).
  const isMedico = usuarioAEditar?.rol === 'medico';
  const selectedRol = usuarioAEditar?.rol || '';
  console.log(isMedico)
  console.log(selectedRol)
  const htmlContent = `
        <input id="swal-dni" class="swal2-input" placeholder="DNI" value="${usuarioAEditar?.dni || ''}" required>
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${usuarioAEditar?.nombre || ''}" required>
        <input id="swal-apellido" class="swal2-input" placeholder="Apellido" value="${usuarioAEditar?.apellido || ''}" required>
        <input id="swal-email" class="swal2-input" type="email" placeholder="Email" value="${usuarioAEditar?.email || ''}" required>
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${usuarioAEditar?.telefono || ''}">
        <input id="swal-fecha_nac" class="swal2-input" type="date" placeholder="Fecha Nacimiento" value="${usuarioAEditar?.fecha_nacimiento ? (usuarioAEditar.fecha_nacimiento as any).substring(0, 10) : ''}">
        
        ${!usuarioAEditar ? `
          <label for="swal-rol" class="swal2-label">Rol:</label>
          <select id="swal-rol" class="swal2-select">
            <option value="">-- Seleccionar Rol --</option>
            ${this.rolesDisponibles.map(rol => 
              `<option value="${rol}" ${selectedRol === rol ? 'selected' : ''}>${rol.charAt(0).toUpperCase() + rol.slice(1)}</option>`
            ).join('')}
          </select>
         <div id="especialidad-group" class="${isMedico ? 'hidden-field' : ''}">
                 <label for="swal-especialidad" class="swal2-label">Especialidad:</label>
                 ${especialidadSelect}
          </div>
          <input id="swal-password" class="swal2-input" type="password" placeholder="Contraseña (requerido al crear)" required>
        ` : ''}
    `;
        
    // 4. Ejecución del SweetAlert y Recolección de Datos
    const { value: formValues } = await Swal.fire({
        title: title,
        html: htmlContent,
        focusConfirm: false,
        showCancelButton: true,
        width: 600,
        // Añadir una clase CSS al contenedor de SweetAlert para ocultar el campo de especialidad inicialmente si es necesario.
        customClass: {
            htmlContainer: 'swal2-content-admin',
        },
        // Opcional: Hook para mostrar/ocultar campos al cambiar el rol
        didOpen: () => {
             const rolSelect = document.getElementById('swal-rol') as HTMLSelectElement;
             const especialidadGroup = document.getElementById('especialidad-group') as HTMLDivElement;

             // Función para alternar la visibilidad
             if (rolSelect && especialidadGroup) {
              // Función para alternar la visibilidad
                const toggleEspecialidad = () => {
                  if (rolSelect.value === 'medico') {
                    especialidadGroup.classList.remove('hidden-field');
                  } else {
                    especialidadGroup.classList.add('hidden-field');
                  }
                };

                rolSelect.addEventListener('change', toggleEspecialidad);
                // Ejecutar una vez al abrir
                toggleEspecialidad(); 
              }
        },

        preConfirm: () => {
          const dni = (document.getElementById('swal-dni') as HTMLInputElement).value.trim();
          const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value.trim();
          const apellido = (document.getElementById('swal-apellido') as HTMLInputElement).value.trim();
          const rolEl = document.getElementById('swal-rol') as HTMLSelectElement | null;
          const rol = rolEl ? rolEl.value : (usuarioAEditar?.rol || '');
          const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
          const password = !usuarioAEditar ? (document.getElementById('swal-password') as HTMLInputElement)?.value : undefined;
          const fechaEl = (document.getElementById('swal-fecha_nac') as HTMLInputElement | null);
          const fechaVal = fechaEl ? (fechaEl.value || '').trim() : '';
          let fecha_nacimiento: string | null;
          if (usuarioAEditar) {
            // En edición: si el input está vacío, preservamos la fecha existente del usuario
            fecha_nacimiento = fechaVal !== '' ? fechaVal : (usuarioAEditar.fecha_nacimiento ? (usuarioAEditar.fecha_nacimiento as any).substring(0, 10) : null);
          } else {
            // En creación: aceptamos la fecha indicada o null si no hay valor
            fecha_nacimiento = fechaVal !== '' ? fechaVal : null;
          }

          if (!dni || !nombre || !apellido || !rol || !email || (!usuarioAEditar && !password)) {
            Swal.showValidationMessage('Todos los campos marcados son obligatorios. Seleccione un rol.');
            return false;
          }

          const data: any = {
            dni,
            nombre,
            apellido,
            rol,
            email,
            telefono: (document.getElementById('swal-telefono') as HTMLInputElement).value || null
          };

          // Añadir fecha_nacimiento solo cuando corresponde:
          // - Si estamos creando: puede ser null o la fecha indicada
          // - Si estamos editando: sólo añadirla si el usuario ingresó un nuevo valor (fechaVal !== '')
          if (!usuarioAEditar) {
            data.fecha_nacimiento = fecha_nacimiento;
          } else if (fechaVal !== '') {
            data.fecha_nacimiento = fecha_nacimiento;
          }

          // Si estamos creando (no hay usuarioAEditar), tomamos id_especialidad del select (si corresponde)
          if (!usuarioAEditar) {
            if (rol === 'medico') {
              const especialidadEl = document.getElementById('swal-especialidad') as HTMLSelectElement | null;
              const id_especialidad_str = especialidadEl ? especialidadEl.value : null;
              data.id_especialidad = (id_especialidad_str === null || id_especialidad_str === 'null' || id_especialidad_str === '' ) ? null : Number(id_especialidad_str);
            } else {
              data.id_especialidad = null;
            }
            // id_cobertura sólo se establece al crear; pero decidimos no usar cobertura para usuarios administrativos
            data.id_cobertura = null;
          } else {
            // En edición: preservar los valores existentes del usuario a editar
            data.id_especialidad = usuarioAEditar.id_especialidad ?? null;
            data.id_cobertura = usuarioAEditar.id_cobertura ?? null;
          }

          if (password) data.password = password;

          // Opcional: console.log para debug antes de enviar
          console.log('FormValues a enviar:', data);
          return data;
        }
    });
    
    // ... (Llamada al servicio y manejo de resultados)
    if (formValues) {
        // ... (Tu código existente aquí es correcto) ...
        const serviceCall = usuarioAEditar 
            ? this.adminService.actualizarUsuario(usuarioAEditar.id, formValues)
            : this.adminService.crearUsuario(formValues);

        serviceCall.subscribe({
            next: (res) => {
                if (res.codigo === 200) {
                    Swal.fire('¡Éxito!', res.mensaje, 'success');
                    this.cargarUsuarios(); 
                } else {
                    Swal.fire('Error', res.mensaje || 'No se pudo guardar el usuario.', 'error');
                }
            },
            error: (err) => {
                const mensaje = err.error?.mensaje || 'Error de comunicación con el servidor.';
                Swal.fire('Error', mensaje, 'error');
            }
        });
    }
  }


  //eliminar usuario
  // async eliminarUsuario(usuario: Usuario) {
  //   const confirm = await Swal.fire({
  //     title: `¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`,
  //     text: usuario.rol === 'medico'
  //       ? 'Se eliminarán también todas sus especialidades asociadas.'
  //       : 'Esta acción no se puede deshacer.',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Eliminar',
  //     cancelButtonText: 'Cancelar',
  //     confirmButtonColor: '#d33'
  //   });

  //   if (confirm.isConfirmed) {
  //     this.adminService.eliminarUsuario(usuario.id).subscribe({
  //       next: () => {
  //         Swal.fire('Eliminado', 'El usuario fue eliminado correctamente.', 'success');
  //         this.cargarUsuarios();
  //       },
  //       error: () => Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error')
  //     });
  //   }
  // }


}
