
const { getCoberturas } = require('../database/cobertura.db');
import { getConnection } from "./../database/database";
import { verificarAdmin } from "./usuario.controller.js";


// 1. OBTENER TODAS LAS COBERTURAS
const obtenerCoberturas = async (req, res) => {
    try{
       
        const response = await getCoberturas();
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

// 2. CREAR COBERTURA
const crearCobertura = async (req, res) => {
    try {
        const resultadoVerificar = verificarAdmin(req);
        
        if (resultadoVerificar.estado === false) {
            return res.status(403).send({ // Usar 403 Forbidden para denegar acceso
                codigo: -1, 
                mensaje: resultadoVerificar.error || "Acceso denegado."
            });
        }
        
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).send("Debe enviar el nombre de la cobertura");
        }
        const connection = await getConnection();
        const resultado = await connection.query("INSERT INTO cobertura SET ?", { nombre });

        return res.status(201).json({ // Usar 201 Created para recursos nuevos
            codigo: 200,
            mensaje: "Cobertura creada con éxito",
            id_insertado: resultado.insertId
        });
    } catch (error) {
        console.error("Error en crearCobertura:", error);
        return res.status(500).json({ 
            codigo: 500,
            mensaje: "Error interno del servidor.",
            detalles: error.message 
        });
    }
};

// 3. ACTUALIZAR COBERTURA
const actualizarCobertura = async (req, res) => {
    try {
        const resultadoVerificar = verificarAdmin(req);
        
        if (resultadoVerificar.estado === false) {
            return res.status(403).json({ codigo: 403, mensaje: resultadoVerificar.error || "Acceso denegado." });
        }

        const { id } = req.params;
        const { nombre } = req.body;
        if (!id || !nombre) {
            return res.status(400).send("Debe enviar el ID y el nuevo nombre de la cobertura.");
        }
        const connection = await getConnection();
        // Usar UPDATE y WHERE para actualizar solo la fila específica
        const resultado = await connection.query("UPDATE cobertura SET nombre = ? WHERE id = ?", [nombre, id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                codigo: 404,
                mensaje: `Cobertura con ID ${id} no encontrada.`
            });
        }

       return res.status(200).json({ // 200 OK para actualización exitosa
            codigo: 200,
            mensaje: `Cobertura con ID ${id} actualizada a: ${nombre}`
        });
    } catch (error) {
        
        return res.status(500).json({
            codigo: 500,
            mensaje: "Error interno del servidor al actualizar."
        });
    }
};

// 4. ELIMINAR COBERTURA (CON VERIFICACIÓN)
const eliminarCobertura = async (req, res) => {
    let connection;
    try {
        console.log("DEBUG 1: Iniciando eliminación...");
        const resultadoVerificar = verificarAdmin(req);

        // 1. Manejo de Acceso Denegado
        if (resultadoVerificar.estado === false) {
            
            return res.status(403).json({
                codigo: 403, 
                mensaje: resultadoVerificar.error || "Acceso denegado."
            });
        }
        const { id } = req.params;

        if (!id) {
            return res.status(400).send("Debe proporcionar el ID de la cobertura a eliminar.");
        }

        connection = await getConnection();
        await connection.beginTransaction(); // Iniciar transacción

        // =================================================================
        // VERIFICACIÓN: ¿Está asociada a algún USUARIO? (Pacientes/Médicos)
        // =================================================================
        const usuariosAsociados = await connection.query(
            "SELECT COUNT(*) as count FROM usuario WHERE id_cobertura = ?", [id]
        );
        
        if (usuariosAsociados[0].count > 0) {
            await connection.rollback();
            // MENSAJE POR USUARIOS ASOCIADOS
            return res.status(409).json({ 
                codigo: -1, 
                mensaje: `No se puede eliminar la cobertura. Está asignada a ${usuariosAsociados[0].count} usuario(s).`
            });
        }

        // Eliminamos todas las filas asociadas en la tabla de unión 'cobertura_especialidad'
        await connection.query("DELETE FROM cobertura_especialidad WHERE id_cobertura = ?", [id]);

        // =================================================================
        // ELIMINACIÓN FINAL DE LA COBERTURA
        // =================================================================
        const resultado = await connection.query("DELETE FROM cobertura WHERE id = ?", [id]);
        
        await connection.commit(); // Confirmar si todo salió bien

        // Verificar si se eliminó alguna fila
        if (resultado.affectedRows === 0) {
            console.log("DEBUG 6: Cobertura no encontrada (404).");
            return res.status(404).json({
                codigo: 404,
                mensaje: "Cobertura no encontrada o ya eliminada."
            });
        }

        // Respuesta de Éxito
        return res.status(200).json({ 
            codigo: 200,
            mensaje: `Cobertura con ID ${id} eliminada con éxito.`
        });


    } catch (error) {
       if (connection) {
            await connection.rollback(); 
        }
        console.error("DEBUG 8: Error en el bloque catch:", error);

        return res.status(500).json({
            codigo: 500,
            mensaje: "Error interno del servidor al eliminar."
        });
    }
};

module.exports = {
    obtenerCoberturas,
    crearCobertura,
    actualizarCobertura,
    eliminarCobertura
};