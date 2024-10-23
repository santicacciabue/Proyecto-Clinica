import { getConnection } from "./../database/database";

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
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
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
        const response = await connection.query("SELECT ME.id_medico, U.nombre, U.apellido, ME.id_especialidad from medico_especialidad ME join usuario U on ME.id_medico = U.id where id_especialidad = ? ",id_especialidad);
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: 200, mensaje:"OK: No existe médico para esa especialidad", payload: []})
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


function verificarToken(req){
    const token = req.headers.authorization;
    if(!token){
        return {estado: false, error: "Token no proporcionado"}
    }
    try{
        const payload = jwt.verify(token, secret);
        if(Date.now() > payload.exp){
            return {estado: false, error: "Token expirado"}
        }
        return {estado: true};
    }
    catch(error){
        return {estado: false, error: "Token inválido"}
    }  

}



export const methods = {
    obtenerEspecialidades,
    obtenerEspecialidadesMedico,
    crearMedicoEspecialidad,
    obtenerCoberturas,
    obtenerMedicoPorEspecialidad
}