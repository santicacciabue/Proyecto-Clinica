import { getConnection } from "./../database/database";
import { verificarToken } from "./usuario.controller.js";
import { verificarRol } from "./usuario.controller.js";
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

//metodo para el flujo de medico    
const obtenerMisTurnos = async (req, res) => {
    try{
        // 1. Verificar el rol y obtener el ID (Seguridad y Autenticación)
        const resultadoVerificarMedico = verificarRol(req, 'medico');

        if(resultadoVerificarMedico.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificarMedico.error})
        }
        
        // ID DEL MÉDICO EXTRAÍDO DEL TOKEN
        const id_medico_autenticado = resultadoVerificarMedico.id;

        // 2. Obtener la fecha del body (Único parámetro necesario del frontend)
        const { fecha } = req.body; 

        if (!fecha) {
            return res.status(400).json({ codigo: -1, mensaje: "La fecha es obligatoria." });
        }
        
        const connection = await getConnection();
        
        // 3. Ejecutar la misma consulta, usando el ID del TOKEN
        const response = await connection.query("SELECT CONCAT(u_paciente.apellido,', ', u_paciente.nombre) AS nombre_paciente,u_paciente.fecha_nacimiento, CONCAT(u_medico.apellido, ', ', u_medico.nombre) AS nombre_medico,t.id as id_turno, t.fecha, t.hora, t.nota, c.nombre as cobertura FROM agenda a JOIN turno t ON a.id = t.id_agenda JOIN usuario u_paciente ON t.id_paciente = u_paciente.id AND u_paciente.rol = 'paciente' JOIN usuario u_medico ON a.id_medico = u_medico.id AND u_medico.rol = 'medico' JOIN cobertura c ON t.id_cobertura = c.id WHERE a.id_medico = ? AND t.fecha = ?", [id_medico_autenticado, fecha]);
        
        res.json({codigo: 200, mensaje: "OK", payload: response});
        
    }
    catch(error){
        // Usar un solo send
        res.status(500).json({ codigo: 500, mensaje: "Error del servidor", error: error.message });
    }
}


const obtenerHorasOcupadas = async (req, res) => {
    try {
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }

        // Asumimos que sigue usando POST con id_medico y fecha en el body
        const { id_medico, fecha } = req.body; 

        if (!id_medico || !fecha) {
            return res.status(400).json({ codigo: -1, mensaje: "Faltan parámetros: id_medico o fecha" });
        }
        
        const connection = await getConnection();
        
        // QUERY SIMPLE: Solo trae la columna 'hora'
        const query = `
            SELECT T.hora 
            FROM turno T 
            JOIN agenda A ON T.id_agenda = A.id 
            WHERE A.id_medico = ? AND T.fecha = ?
        `;

        const response = await connection.query(query, [id_medico, fecha]);
        
        // Response será un array de objetos: [{ hora: '09:00' }, { hora: '10:00' }]
        res.json({ codigo: 200, mensaje: "OK", payload: response });
    } catch (error) {
        res.status(500).json({ codigo: 500, mensaje: "Error del servidor", error: error.message });
    }
};


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
        // Imprime el error de SQL detallado en la consola del servidor
        console.error("ERROR AL ASIGNAR TURNO:", error.message); 
    
        res.status(500).json({ 
            codigo: 500, 
            mensaje: "Error interno del servidor al asignar turno. Revise los logs del servidor.", 
            detalle_error: error.message // Puedes enviar el detalle para debug rápido si quieres
        });
        
    }
}

//asignacion de turno de parte del operador

const asignarTurnoPacienteOperador = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const { id_paciente, id_agenda, fecha, hora, nota, id_cobertura } = req.body;
        
        const connection = await getConnection();
        
        const [agendaInfo] = await connection.query("SELECT id_medico FROM agenda WHERE id = ?", id_agenda);
        if (!agendaInfo) {
            return res.json({ codigo: 404, mensaje: "Agenda no encontrada." });
        }
        const id_medico = agendaInfo.id_medico;
        
        // 🛑 1. VALIDACIÓN: Turno duplicado para el mismo paciente en la misma fecha/hora/médico.
        const queryCheckTurnoDiarioMedico = `
        SELECT COUNT(T.id) AS count
        FROM turno T
        JOIN agenda A ON T.id_agenda = A.id
        WHERE T.id_paciente = ? 
          AND T.fecha = ? 
          AND A.id_medico = ?
        `;
        const [resultadoDiarioMedico] = await connection.query(
            queryCheckTurnoDiarioMedico, 
            [id_paciente, fecha, id_medico]
        );
        
        if (resultadoDiarioMedico.count > 0) {
            return res.json({ 
                codigo: 4, // Código de error para el frontend
                mensaje: "El paciente ya tiene un turno asignado con este médico en esta fecha. Solo se permite un turno por médico por día." 
            });
        }
    
        // 3. VALIDACIÓN: Turno ya ocupado por otro paciente (hora/fecha/médico)
        const queryCheckOcupado = `
            SELECT COUNT(T.id) AS count
            FROM turno T
            WHERE T.fecha = ? 
            AND T.hora = ?
            AND T.id_agenda IN (SELECT id FROM agenda WHERE id_medico = ?)
        `;
        const [resultadoOcupado] = await connection.query(
            queryCheckOcupado, 
            [fecha, hora, id_medico]
        );

        if (resultadoOcupado.count > 0) {
            return res.json({ 
                codigo: 5, 
                mensaje: "Este horario acaba de ser ocupado. Intente con otro horario." 
            });
        }
        
        
        // 3. Proceder con la inserción si las validaciones pasan
        const turno = { id_paciente, id_agenda, fecha, hora, nota, id_cobertura };
        const response = await connection.query("INSERT INTO turno SET ?", turno);

        res.json ({codigo: 200, mensaje: "Turno asignado con éxito", payload: { id: response.insertId }});
    }
    catch(error){
        console.error("Error asignando turno:", error);
        res.status(500).send(error.message);
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


export const methods = {
    obtenerTurnoPaciente,
    obtenerTurnosMedico,
    obtenerHorasOcupadas,
    asignarTurnoPaciente,
    actualizarTurnoPaciente,
    eliminarTurnoPaciente,
    obtenerMisTurnos,
    asignarTurnoPacienteOperador
};