import { getConnection } from "./../database/database";
const secret = process.env.secret;
const jwt = require ("jsonwebtoken");

// Obtener turnos de un paciente
const obtenerTurnoPaciente = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const {id} = req.params
        const connection = await getConnection();
        const response = await connection.query("SELECT T.id as id_turno, T.nota, T.fecha, T.hora, T.id_paciente, T.id_cobertura, U.nombre as nombre_medico, U.apellido as apellido_medico, E.id as id_especialidad, E.descripcion as especialidad from turno T         join agenda A on T.id_agenda = A.id join usuario U on A.id_medico = U.id join especialidad E on A.id_especialidad = E.id where id_paciente = ?",id);
        res.json({codigo: 200, mensaje: "OK", payload:  response});
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

// Obtener turnos de un médico en una fecha
const obtenerTurnosMedico = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const {
            id_medico,
            fecha
        } = req.body
        const connection = await getConnection();
        const response = await connection.query("SELECT CONCAT(u_paciente.apellido,', ', u_paciente.nombre) AS nombre_paciente,u_paciente.fecha_nacimiento, CONCAT(u_medico.apellido, ', ', u_medico.nombre) AS nombre_medico,t.id as id_turno, t.fecha, t.hora, t.nota, c.nombre as cobertura FROM agenda a JOIN turno t ON a.id = t.id_agenda JOIN usuario u_paciente ON t.id_paciente = u_paciente.id AND u_paciente.rol = 'paciente' JOIN usuario u_medico ON a.id_medico = u_medico.id AND u_medico.rol = 'medico' JOIN cobertura c ON t.id_cobertura = c.id WHERE a.id_medico = ? AND t.fecha = ?", [id_medico, fecha]);
        res.json({codigo: 200, mensaje: "OK", payload:  response});
    }
    catch(error){
        res.status(500).json({ codigo: 500, mensaje: "Error del servidor", error: error.message });
        res.send(error.message);
    }
}

//Crear turno para un paciente
const asignarTurnoPaciente = async (req, res) => {
    try {
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const { nota, id_agenda,fecha,hora,id_paciente,id_cobertura } = req.body;
       
        const turno = {nota, id_agenda,fecha,hora,id_paciente,id_cobertura}
        const connection = await getConnection();
        await connection.query("INSERT INTO turno SET ?",turno)
       res.json({codigo: 200, message: "Turno asignado correctamente", payload: []})
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
}

//UPDATE turno de un paciente
const actualizarTurnoPaciente = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const {id} = req.params;
        const { nota, id_agenda,fecha,hora,id_paciente,id_cobertura } = req.body;
       
        const turno = {nota, id_agenda,fecha,hora,id_paciente,id_cobertura}

        const connection = await getConnection();
        await connection.query("UPDATE turno set ? where id = ?",[turno,id])
        res.json ({codigo: 200, mensaje: "Turno modificado", payload: []});
    }
    catch(error){
        res.status(500);
        res.send(error.message);
    }
}

//eliminar turno de un paciente
const eliminarTurnoPaciente = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const {id}= req.params;
        const connection = await getConnection();
        const result = await connection.query("Delete FROM turno WHERE id = ?",id);
        res.json(result);
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
    obtenerTurnoPaciente,
    obtenerTurnosMedico,
    asignarTurnoPaciente,
    actualizarTurnoPaciente,
    eliminarTurnoPaciente
};