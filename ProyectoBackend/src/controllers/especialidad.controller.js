import { getConnection } from "./../database/database";
import { verificarToken } from "./usuario.controller.js";
const { getCoberturas } = require('../database/cobertura.db');
import { verificarAdmin } from "./usuario.controller.js";

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

const crearEspecialidad = async (req, res) => {
    let connection;
    try {
        //  1. VERIFICAR ROL DE ADMINISTRADOR 
        const resultadoVerificar = verificarAdmin(req);
        if (resultadoVerificar.estado == false) {
            // Usar status 403 Forbidden para acceso denegado
            return res.status(403).send({ codigo: -1, mensaje: resultadoVerificar.error }); 
        }

        const { descripcion, id_coberturas } = req.body;
        const coberturasArray = Array.isArray(id_coberturas) ? id_coberturas.map(Number) : [Number(id_coberturas)];
        console.log(`DEBUG: Creando Especialidad. Descripcion: ${descripcion}, ID_Cobertura: ${id_coberturas}`);

        if (!descripcion || coberturasArray.length === 0 || coberturasArray.some(isNaN)) {
             return res.status(400).send({ codigo: -1, mensaje: "Faltan datos válidos (descripción o IDs de cobertura válidos)." });
        }

        connection = await getConnection();
        await connection.beginTransaction(); // Iniciar la transacción

        // =================================================================
        // 3. VALIDACIÓN DE UNICIDAD
        // =================================================================
        const especialidadExistente = await connection.query(
            "SELECT id FROM especialidad WHERE descripcion = ?", [descripcion]
        );
        
        if (especialidadExistente.length > 0) {
            await connection.rollback();
            // 🛑 MENSAJE DE ESPECIALIDAD EXISTENTE 🛑
            return res.status(409).json({ 
                codigo: -1, 
                mensaje: "Error: La especialidad con esa descripción ya existe." 
            });
        }
        
        const resultadoEspecialidad = await connection.query(
            "INSERT INTO especialidad SET ?", 
            { descripcion } // La tabla solo tiene 'descripcion'
        );
        
        const id_especialidad = resultadoEspecialidad.insertId;

        if (!id_especialidad) {
            throw new Error("No se pudo obtener el ID de la nueva especialidad.");
        }

        const asociaciones = coberturasArray.map(id_cobertura => 
             [id_especialidad, id_cobertura] // Array de [id_especialidad, id_cobertura]
        );


        // =================================================================
        // 4. INSERCIÓN 2: Crear la Asociación en la tabla de unión
        // =================================================================

        const queryMultiple = "INSERT INTO cobertura_especialidad (id_especialidad, id_cobertura) VALUES ?";
        const resultadoAsociacion = await connection.query(queryMultiple, [asociaciones]);

        if (resultadoAsociacion.affectedRows === 0) {
            throw new Error("Error al asociar especialidad con las coberturas.");
        }
      
        await connection.commit(); // Confirmar la transacción

        return res.status(201).json({ 
            codigo: 200, 
            mensaje: `Especialidad creada y asociada a ${coberturasArray.length} cobertura(s) con éxito.`, 
            id: id_especialidad 
        });
    } catch (error) {
        if (connection) {
            await connection.rollback(); // Deshacer si hubo un error
        }
        
        console.error("CRITICAL ERROR en crearEspecialidad:", error);
        
        let mensajeError = "Error interno del servidor al crear especialidad.";
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             mensajeError = "Una o más Coberturas seleccionadas no existen (ID de cobertura inválido).";
        }
        
        return res.status(500).json({ 
            codigo: 500, 
            mensaje: mensajeError,
            detalles: error.message 
        });
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

//  ASOCIAR COBERTURAS A ESPECIALIDAD
const asociarCoberturas = async (req, res) => {
    let connection;
    try {
        const resultadoVerificar = verificarAdmin(req);
        if (resultadoVerificar.estado == false) {
             return res.status(403).send({ codigo: -1, mensaje: resultadoVerificar.error }); 
        }

        const { id } = req.params; // id de la especialidad
        const { id_coberturas } = req.body; // array de nuevos IDs de cobertura
        
        const coberturasArray = Array.isArray(id_coberturas) ? id_coberturas.map(Number) : [Number(id_coberturas)];

        if (!id || coberturasArray.length === 0 || coberturasArray.some(isNaN)) {
             return res.status(400).send({ codigo: -1, mensaje: "Faltan datos válidos (ID de especialidad o IDs de cobertura)." });
        }

        connection = await getConnection();
        await connection.beginTransaction(); 

        const asociaciones = coberturasArray.map(id_cobertura => 
             [id, id_cobertura]
        );
        
        const queryMultiple = "INSERT INTO cobertura_especialidad (id_especialidad, id_cobertura) VALUES ?";
        const resultadoAsociacion = await connection.query(queryMultiple, [asociaciones]);

        await connection.commit(); 

        return res.status(201).json({ 
            codigo: 200, 
            mensaje: `Especialidad ${id} asociada a ${resultadoAsociacion.affectedRows} nueva(s) cobertura(s).`, 
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        
        let mensajeError = "Error interno del servidor al asociar coberturas.";
        if (error.code === 'ER_DUP_ENTRY') {
             mensajeError = "Una o más asociaciones ya existen.";
             return res.status(409).json({ codigo: -1, mensaje: mensajeError });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             mensajeError = "Una o más Coberturas/Especialidades no existen.";
        }
        
        return res.status(500).json({ codigo: 500, mensaje: mensajeError, detalles: error.message });
    }
};

const obtenerCoberturasNoAsociadas = async (req, res) => {
    try {
        const { id } = req.params; // ID de la especialidad
        
        const connection = await getConnection();
        
        // Query para obtener Coberturas que NO están en la tabla de unión para esa Especialidad
        const query = `
            SELECT C.id, C.nombre 
            FROM cobertura C
            WHERE C.id NOT IN (
                SELECT id_cobertura 
                FROM cobertura_especialidad 
                WHERE id_especialidad = ?
            )
        `;
        
        const response = await connection.query(query, [id]);
        
        res.json({ codigo: 200, mensaje: "OK", payload: response });
        
    } catch (error) {
        console.error("Error en obtenerCoberturasNoAsociadas:", error);
        res.status(500).send(error.message);
    }
};

// 3. ACTUALIZAR ESPECIALIDAD
const actualizarEspecialidad = async (req, res) => {
    try {
        const resultadoVerificar = verificarAdmin(req);
        
        if (resultadoVerificar.estado === false) {
            return res.status(403).json({ codigo: 403, mensaje: resultadoVerificar.error || "Acceso denegado." });
        }
        const { id } = req.params;
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).send("Debe enviar el nuevo nombre de la especialidad");
        }

        
        const connection = await getConnection();
        const resultado = await connection.query("UPDATE especialidad SET descripcion = ? WHERE id = ?", [nombre, id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                codigo: 404,
                mensaje: `Cobertura con ID ${id} no encontrada.`
            });
        }


        return res.status(200).json({ // 200 OK para actualización exitosa
            codigo: 200,
            mensaje: `Especialidad con actualizada correctamente`
        });
    } catch (error) {
        return res.status(500).json({
            codigo: 500,
            mensaje: "Error interno del servidor al actualizar."
        });
    }
};

const obtenerCoberturasPorEspecialidad = async (req, res) => {
    try {

        const { id } = req.params; // ID de la especialidad

        const resultadoVerificar = verificarAdmin(req);
        
        if (resultadoVerificar.estado === false) {
            return res.status(403).json({ codigo: 403, mensaje: resultadoVerificar.error || "Acceso denegado." });
        }
        
        const connection = await getConnection();
        
        const query = `
            SELECT 
                C.id, 
                C.nombre 
            FROM cobertura C
            JOIN cobertura_especialidad CE 
                ON C.id = CE.id_cobertura
            WHERE CE.id_especialidad = ?
        `;
        
        const response = await connection.query(query, [id]);
        
        if (response.length > 0) {
            res.json({ codigo: 200, mensaje: "OK", payload: response });
        } else {
            res.json({ codigo: 200, mensaje: "OK: No hay coberturas asociadas.", payload: [] });
        }
    } catch (error) {
        console.error("Error en obtenerCoberturasPorEspecialidad:", error);
        res.status(500).send(error.message);
    }
};

// ELIMINAR ESPECIALIDAD (CON VERIFICACIÓN)
const eliminarEspecialidad = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { id_cobertura } = req.body;

        connection = await getConnection();
        await connection.beginTransaction();

        // -----------------------------------------------------------
        // ELIMINACIÓN DE ASOCIACIÓN (Si se especificó una cobertura)
        // -----------------------------------------------------------
        if (id_cobertura) {
             console.log(`DEBUG: Eliminando asociación ${id} de cobertura ${id_cobertura}`);
             
             // Eliminar solo la relación específica
             const resultadoDesasociar = await connection.query(
                 "DELETE FROM cobertura_especialidad WHERE id_especialidad = ? AND id_cobertura = ?", 
                 [id, id_cobertura]
             );
             
             if (resultadoDesasociar.affectedRows === 0) {
                 await connection.rollback();
                 return res.status(404).json({ codigo: -1, mensaje: "La asociación no existe o ya fue eliminada." });
             }

             // Ahora verificamos si quedan otras asociaciones para decidir si eliminar la especialidad
             const asociacionesRestantes = await connection.query(
                 "SELECT COUNT(*) as count FROM cobertura_especialidad WHERE id_especialidad = ?", [id]
             );

             if (asociacionesRestantes[0].count > 0) {
                 // Si quedan más asociaciones, solo eliminamos la relación y terminamos.
                 await connection.commit();
                 return res.json({ codigo: 200, mensaje: `Asociacion de especialidad ID:${id} con cobertura ID:${id_cobertura} eliminada. La especialidad persiste.` });
             }
        }

        // -----------------------------------------------------------
        // VERIFICAR ASOCIACIONES CON MÉDICOS
        // -----------------------------------------------------------
        
        const medicosAsociados = await connection.query(
            "SELECT COUNT(*) as count FROM medico_especialidad WHERE id_especialidad = ?", [id]
        );

        if (medicosAsociados[0].count > 0) {
            await connection.rollback();
            return res.send({
                codigo: -1, // Código de error personalizado para el frontend
                mensaje: "No se puede eliminar la especialidad. Hay médicos asociados a ella."
            });
        }

        await connection.query("DELETE FROM cobertura_especialidad WHERE id_especialidad = ?", [id]);
        const resultadoEliminacion = await connection.query("DELETE FROM especialidad WHERE id = ?", [id]);
        await connection.commit();

        if (resultadoEliminacion.affectedRows === 0) {
             return res.status(404).json({ codigo: 404, mensaje: "Especialidad no encontrada." });
        }
        res.json({ codigo: 200, mensaje: "Especialidad eliminada completamente." });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("CRITICAL 500 ERROR en eliminarEspecialidad:", error);
        res.status(500).send(error.message);
    }
};





export const methods = {
    obtenerEspecialidades,
    obtenerEspecialidadesMedico,
    crearMedicoEspecialidad,
    obtenerCoberturas,
    obtenerMedicoPorEspecialidad,
    eliminarEspecialidad,
    actualizarEspecialidad,
    crearEspecialidad,
    obtenerCoberturasPorEspecialidad,
    asociarCoberturas,
    obtenerCoberturasNoAsociadas
}