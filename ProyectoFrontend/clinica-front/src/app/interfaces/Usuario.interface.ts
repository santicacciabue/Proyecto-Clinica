export interface Usuario {
    id: number;
    dni: string;
    apellido: string;
    nombre: string;
    fecha_nacimiento: Date;
    rol?: 'medico' | 'operador' | 'administrador';
    email: string;
    telefono: string;
    id_cobertura?: number;
    nombre_cobertura?: string;

    // Nuevos campos para médicos
    id_especialidad?: number;
    especialidad?: string;
}