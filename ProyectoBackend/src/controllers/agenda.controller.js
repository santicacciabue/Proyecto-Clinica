import { getConnection } from "./../database/database";
import { verificarToken } from "./usuario.controller.js";
import { verificarRol } from "./usuario.controller.js"
const secret = process.env.secret;
const jwt = require ("jsonwebtoken");

const obtenerAgenda = async (req, res) => {
    try{
        const {id_medico } = req.params;
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("SELECT * from agenda where id_medico = ?",id_medico);
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: 200, mensaje:"Médico no posee agenda", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }



    
}

const crearAgenda = async (req, res) => {
    try{
        const {
            id_medico,
            id_especialidad,
            fecha,
            hora_entrada,
            hora_salida,
         } = req.body;
         const registroAgenda = {
            id_medico,
            id_especialidad,
            fecha,
            hora_entrada,
            hora_salida,
         };
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("INSERT INTO agenda SET ?",registroAgenda);
        if(response.affectedRows > 0){
            res.json({codigo: 200, mensaje: "OK", payload:  [{id_agenda: response.insertId}]});
        }
        else{
            res.json({codigo: -1, mensaje: "Error insertando agenda", payload:  []});
        }
        
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
    
}

//metodo para el flujo de medico
const crearMiAgenda = async (req, res) => {
    try{
        // 1. Verificar el rol y obtener el ID (Seguridad y Autenticación)
        const resultadoVerificarMedico = verificarRol(req, 'medico');

        if(resultadoVerificarMedico.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificarMedico.error})
        }
        
        // ID DEL MÉDICO EXTRAÍDO DEL TOKEN
        const id_medico = resultadoVerificarMedico.id;

        const {
            id_especialidad, // Se espera que el frontend lo envíe
            fecha,
            hora_entrada,
            hora_salida,
        } = req.body;
        
        if (!id_especialidad || !fecha || !hora_entrada || !hora_salida) {
            return res.status(400).json({ codigo: -1, mensaje: "Faltan parámetros de agenda." });
        }

        const registroAgenda = {
             // 🟢 Usamos el ID del token
             id_medico, 
             id_especialidad,
             fecha,
             hora_entrada,
             hora_salida,
        };
        
        const connection = await getConnection();
        const response = await connection.query("INSERT INTO agenda SET ?",registroAgenda);

        if(response.affectedRows > 0){
             res.json({codigo: 200, mensaje: "OK", payload: [{id_agenda: response.insertId}]});
        }
        else{
             res.json({codigo: -1, mensaje: "Error insertando agenda", payload: []});
        }
        
    }
    catch(error){
        res.status(500);
        res.send(error.message);
    }
}

const modificarAgenda = async (req, res) => {
    let connection;
    try{
        const { id } = req.params
        const {
            id_medico,
            id_especialidad,
            fecha,
            hora_entrada,
            hora_salida,
         } = req.body;
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        connection = await getConnection();
        // VERIFICAR INCONSISTENCIA DE TURNOS ASIGNADOS
        const queryTurnosConflicto = `
            SELECT COUNT(id) AS turnos_en_conflicto
            FROM turno 
            WHERE id_agenda = ? 
            AND (
                TIME(hora) < TIME(?) OR TIME(hora) >= TIME(?)
            );
        `;
        // Utilizamos >= para la hora_salida ya que no queremos turnos EXACTAMENTE A la hora de salida.
        
        const [resultadoConflicto] = await connection.query(
            queryTurnosConflicto, 
            [id, hora_entrada, hora_salida]
        );
        
        const turnosEnConflicto = resultadoConflicto.turnos_en_conflicto;

        if (turnosEnConflicto > 0) {
            // DEVOLVER ERROR CONTROLADO SI HAY CONFLICTO
            return res.json({ 
                codigo: 2, // Usamos un código de error específico para el frontend (ej: 2)
                mensaje: `No se puede modificar el horario: ${turnosEnConflicto} turno(s) asignado(s) quedaría(n) fuera del nuevo rango. Cancele los turnos primero.` 
            });
        }

        // Proceder con el UPDATE si no hay conflictos
        const registroAgenda = { id_medico, id_especialidad, fecha, hora_entrada, hora_salida };
        const response = await connection.query("UPDATE agenda SET ? WHERE id = ?",[registroAgenda, id]);
        
        if(response.affectedRows > 0){
            res.json({codigo: 200, mensaje: "Agenda modificada con éxito.", payload:  []});
        }
        else{
            res.json({codigo: 1, mensaje: "Error modificando agenda (0 filas afectadas).", payload:  []});
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }

}


// metodo específico para que el médico obtenga su agenda por fecha
const obtenerHorariosMedico = async (req, res) => {
    try{
        const { id_medico } = req.params;
        // La fecha viene de los Query Params, como lo necesita el frontend del médico
        const { fecha } = req.query; 

        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        
        let query = "SELECT * from agenda where id_medico = ?";
        let params = [id_medico];

        if (fecha) {
            query += " AND fecha = ?";
            params.push(fecha);
        } else {
             // Si el médico no envía fecha, solo devolvemos las del día actual o las próximas
             // Para esta implementación, obligamos al médico a enviar la fecha desde el frontend.
             return res.status(400).json({ codigo: -1, mensaje: "La fecha es obligatoria para la gestión de agenda del médico." });
        }

        const connection = await getConnection();
        // Nota: Mantenemos el acceso a la respuesta según tu driver
        const response = await connection.query(query, params); 
        
        if(response.length > 0){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: 200, mensaje:"Médico no posee horarios cargados para esta fecha", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
};


// metodo para que el médico (o el operador) elimine un rango horario.
// Usa DELETE por ID de la agenda.
const eliminarHorarioAgenda = async (req, res) => {
    try{
        const { id } = req.params; // id de la fila en la tabla 'agenda'
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        // Usar DELETE FROM agenda WHERE id = ?
        const response = await connection.query("DELETE FROM agenda WHERE id = ?", id); 
        
        if(response.affectedRows > 0){
            res.json({codigo: 200, mensaje: "Rango horario eliminado correctamente", payload: []});
        } else {
            res.json({codigo: -1, mensaje: "No se encontró el rango horario para eliminar", payload: []});
        }
    }
    catch(error){
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.json({ 
                 codigo: -2, 
                 mensaje: "No se puede eliminar este rango horario porque tiene turnos asignados." 
             });
        }
        res.status(500);
        res.send(error.message);
    }
}


// metodo específico para que el operador obtenga la lista de médicos con agenda abierta
const obtenerMedicosConAgendaAbierta = async (req, res) => {
    try {
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        
        // La fecha viene de los Query Params, como lo requiere la vista del operador
        const { fecha } = req.query; 

        if (!fecha) {
            return res.status(400).json({ codigo: -1, mensaje: "La fecha es obligatoria." });
        }

        const connection = await getConnection();
        
        // Consulta que trae médico, especialidad y rangos horarios para la fecha
        const query = `
            SELECT 
                U.id AS id_medico,
                CONCAT(U.nombre, ' ', U.apellido) AS nombre_medico,
                E.descripcion AS especialidad,
                GROUP_CONCAT(CONCAT(A.hora_entrada, ' a ', A.hora_salida) SEPARATOR ' | ') AS rangos_horarios
            FROM agenda A
            JOIN usuario U ON A.id_medico = U.id
            JOIN especialidad E ON A.id_especialidad = E.id
            WHERE A.fecha = ?
            GROUP BY U.id, U.nombre, U.apellido
            ORDER BY U.apellido
        `;

        const response = await connection.query(query, [fecha]);

        res.json({ codigo: 200, mensaje: "OK", payload: response });

    } catch (error) {
        res.status(500).json({ codigo: 500, mensaje: "Error del servidor", error: error.message });
    }
};

// const eliminarAgenda = async (req, res) => {
//     try{
//         const { id } = req.params
//         const resultadoVerificar = verificarToken(req);
//         if(resultadoVerificar.estado == false){
//             return res.send({codigo: -1, mensaje: resultadoVerificar.error})
//         }
//         const connection = await getConnection();
//         const response = await connection.query("UPDATE agenda SET ? where id = ?",[registroAgenda,id]);
//         res.json({codigo: 200, mensaje: "OK", payload:  response});
//     }
//     catch(error){
//             res.status(500);
//             res.send(error.message);
//     }
// }




export const methods = {
    obtenerAgenda,
    crearAgenda,
    modificarAgenda,
    obtenerHorariosMedico,
    obtenerMedicosConAgendaAbierta,
    eliminarHorarioAgenda,
    crearMiAgenda
}