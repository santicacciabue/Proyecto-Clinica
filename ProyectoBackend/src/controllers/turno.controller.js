import { getConnection } from "./../database/database";

// Obtener turnos de un paciente
const obtenerTurnoPaciente = async (req, res) => {
    try{
        const {id} = req.params
        const connection = await getConnection();
        const response = await connection.query("SELECT * from turno where id_paciente = ?",id);
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
        const {
            id_medico,
            fecha
        } = req.params
        const connection = await getConnection();
        const response = await connection.query("SELECT CONCAT(u_paciente.apellido,', ', u_paciente.nombre) AS nombre_paciente, CONCAT(u_medico.apellido, ', ', u_medico.nombre) AS nombre_medico, t.fecha, t.hora, t.nota, c.nombre as cobertura FROM agenda a JOIN turno t ON a.id = t.id_agenda JOIN usuario u_paciente ON t.id_paciente = u_paciente.id AND u_paciente.rol = 'paciente' JOIN usuario u_medico ON a.id_medico = u_medico.id AND u_medico.rol = 'medico' JOIN cobertura c ON t.id_cobertura = c.id WHERE a.id_medico = ? AND t.fecha = ?", [id_medico, fecha]);
        res.json({codigo: 200, mensaje: "OK", payload:  response});
    }
    catch(error){
        res.status(500).json({ codigo: 500, mensaje: "Error del servidor", error: error.message });
        res.send(error.message);
    }
}

export const methods = {
    obtenerTurnoPaciente,
    obtenerTurnosMedico
};