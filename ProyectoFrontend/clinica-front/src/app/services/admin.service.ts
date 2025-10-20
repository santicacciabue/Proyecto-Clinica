// src/app/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})  
export class AdminService {
    
 private API_URL = 'http://localhost:4000/api';
 private ADMIN_API_URL = this.API_URL + '/admin';

  constructor(private http: HttpClient) { }

  // Métodos de Coberturas
  obtenerTodasCoberturas(): Observable<any> {
    // Si ya tienes este método en ClinicaService, puedes reutilizarlo.
    return this.http.get<any>(`${this.API_URL}/obtenerCoberturas`);
  }

  crearCobertura(nombre: string): Observable<any> {
    return this.http.post<any>(`${this.ADMIN_API_URL}/coberturas`, { nombre });
  }

  actualizarCobertura(id: number, datos: { nombre: string }): Observable<any> {
    // CRUD ADMIN: PUT a /api/admin/coberturas/:id
    return this.http.put(`${this.API_URL}/admin/coberturas/${id}`, datos);
  }

  eliminarCobertura(id: number): Observable<any> {
    return this.http.delete(`${this.ADMIN_API_URL}/coberturas/${id}`);
  }

    // Métodos de Especialidades
    obtenerTodasEspecialidades(): Observable<any> {
        return this.http.get<any>(`${this.ADMIN_API_URL}/especialidades`);
    }

    crearEspecialidad(datos: { descripcion: string, id_coberturas: number[] }): Observable<any> {
      return this.http.post(`${this.ADMIN_API_URL}/especialidades`, datos); 
    }

    actualizarEspecialidad(id: number, nombre: string): Observable<any> {
        return this.http.put<any>(`${this.ADMIN_API_URL}/especialidades/${id}`, { nombre });
    }

    eliminarEspecialidad(id: number, id_cobertura?: number): Observable<any> {
        const options = id_cobertura ? { body: { id_cobertura: id_cobertura } } : {};
        return this.http.delete<any>(`${this.ADMIN_API_URL}/especialidades/${id}`, options);
    }

    
    obtenerCoberturasPorEspecialidad(id_especialidad: number): Observable<any> {
      return this.http.get<any>(`${this.ADMIN_API_URL}/especialidades/${id_especialidad}/coberturas`);
    } 
    
    obtenerCoberturasNoAsociadas(id_especialidad: number): Observable<any> {
      return this.http.get<any>(`${this.ADMIN_API_URL}/especialidades/${id_especialidad}/coberturas/no-asociadas`);
    }

    asociarCoberturas(id: number, id_coberturas: number[]): Observable<any> {
        return this.http.post(`${this.ADMIN_API_URL}/especialidades/${id}/asociar`, { id_coberturas });
    }

    // Métodos de Usuarios para admin
    obtenerUsuarios(): Observable<any> {
        return this.http.get<any>(`${this.ADMIN_API_URL}/usuarios`);
    }

    actualizarUsuario(id: number, datos: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/usuarios/admin/${id}`, datos);
    }

    crearUsuario(datos: any): Observable<any> {
        return this.http.post<any>(`${this.ADMIN_API_URL}/usuarios/admin`, datos);
    }

    eliminarUsuario(id: number): Observable<any> {
      return this.http.delete(`${this.API_URL}/admin/usuarios/${id}`);
    }
}