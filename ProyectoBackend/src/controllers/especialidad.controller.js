import { getConnection } from "./../database/database";
import { verificarToken } from "./usuario.controller.js";

const secret = process.env.secret;
const jwt = require ("jsonwebtoken");



const obtenerEspecialidades = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("SELECT * from especialidad");
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: -1, mensaje:"Error obteniendo especialidades", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
    
}
const obtenerCoberturas = async (req, res) => {
    try{
        const connection = await getConnection();
        const response = await connection.query("SELECT * from cobertura");
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: -1, mensaje:"Error obteniendo coberturas", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
    
}

const obtenerEspecialidadesMedico = async (req, res) => {
    try{
        const {id_medico } = req.params;
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("SELECT ME.id_medico, ME.id_especialidad, E.descripcion from medico_especialidad ME join especialidad E on ME.id_especialidad = E.id where id_medico = ? ",id_medico);
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: 200, mensaje:"OK: Médico no tiene especialidades", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
    
}

const obtenerMedicoPorEspecialidad = async (req, res) => {
    try{
        const {id_especialidad } = req.params;
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const query = `
            SELECT DISTINCT 
                ME.id_medico AS id,        
                U.nombre, 
                U.apellido
            FROM medico_especialidad ME 
            JOIN usuario U ON ME.id_medico = U.id
            JOIN agenda A ON ME.id_medico = A.id_medico    -- <--- AÑADIDO: VINCULA CON AGENDA
            WHERE ME.id_especialidad = ?
        `;
        const response = await connection.query(query, id_especialidad);
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: 200, mensaje:"OK: No existe médico con agenda para esa especialidad", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
    
}

const crearMedicoEspecialidad = async (req, res) => {
    try{
        const {id_medico, id_especialidad } = req.body;
        const registroEspecialidadMedico = { id_medico, id_especialidad};
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("INSERT INTO medico_especialidad SET ?",registroEspecialidadMedico);
        if(response.affectedRows > 0){
            res.json({codigo: 200, mensaje: "OK", payload:  []});
        }
        else{
            res.json({codigo: -1, mensaje: "Error insertando medico especialidad", payload:  []});
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
    
}




export const methods = {
    obtenerEspecialidades,
    obtenerEspecialidadesMedico,
    crearMedicoEspecialidad,
    obtenerCoberturas,
    obtenerMedicoPorEspecialidad
}