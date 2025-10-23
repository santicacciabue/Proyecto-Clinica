export interface HorarioAgenda {
  id: number; 
  hora_entrada: string;
  hora_salida: string;
  fecha: string;
  id_medico: number;
  id_especialidad: number;
}

export interface Turno {
  id_turno: number;
  nombre_paciente: string;
  fecha_nacimiento: string; 
  hora: string;
  cobertura: string;
  nota: string; 
  nombre_medico: string;
}