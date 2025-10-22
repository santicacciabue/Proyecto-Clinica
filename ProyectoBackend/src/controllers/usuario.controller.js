import { getConnection } from "./../database/database";
const jwt = require ("jsonwebtoken");
const secret = process.env.SECRET
// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
    try{
        
        const resultadoVerificarAdmin = verificarAdmin(req);
        if(resultadoVerificarAdmin.estado == false){
            return res.status(403).json({ codigo: -1, mensaje: resultadoVerificarAdmin.error }); 
        }

        const connection = await getConnection();
       const usuarios = await connection.query(`
                                                 SELECT 
                                                    u.id,
                                                    u.nombre,
                                                    u.apellido,
                                                    u.dni,
                                                    u.email,
                                                    u.telefono,
                                                    u.rol,
                                                    c.nombre AS nombre_cobertura,
                                                    e.id AS id_especialidad,
                                                    e.descripcion AS especialidad
                                                FROM usuario u
                                                LEFT JOIN cobertura c ON c.id = u.id_cobertura
                                                LEFT JOIN medico_especialidad me ON me.id_medico = u.id
                                                LEFT JOIN especialidad e ON e.id = me.id_especialidad
                                                WHERE u.rol != 'paciente'
                                                `);

        // Aplicamos la limpieza que evita el formato [[filas], metadata]
        const payloadFinal = limpiarResultado(usuarios);

        res.json({codigo: 200, mensaje: "OK", payload: payloadFinal});
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

const limpiarResultado = (resultadoConsulta) => {
    if (Array.isArray(resultadoConsulta) && Array.isArray(resultadoConsulta[0]) && resultadoConsulta.length > 1) {
        return resultadoConsulta[0]; // Retorna solo el array de filas
    }
    return resultadoConsulta; // Retorna el array original si ya está limpio
};

export function verificarToken(req){
    const token = req.headers.authorization;
    if(!token){
        return {estado: false, error: "Token no proporcionado"}
    }
    console.log("paso")
    try{
        const payload = jwt.verify(token, secret);
        
        const tiempoActualEnSegundos = Math.floor(Date.now() / 1000); 
        
        if(tiempoActualEnSegundos > payload.exp){
            return {estado: false, error: "Token expirado"}
        }
        return { estado: true, payload }; // se agrego el payload al resultado para usar el rol como se ve en la funcion verificarAdmin
    }
    catch(error){
        return {estado: false, error: "Token inválido"}
    }  

}

//Nueva función para verificar si el usuario es Admin
export function verificarAdmin(req) {
    const tokenResultado = verificarToken(req);

    if (tokenResultado.estado === false) {
        return tokenResultado; // Devuelve el error de token (no provisto, inválido, expirado)
    }

    // El payload contiene el rol que se firmó en el token
    const rolUsuario = tokenResultado.payload.rol; 

    if (rolUsuario && rolUsuario.toLowerCase() === 'administrador') {
        return { estado: true };
    } else {
        return { estado: false, error: "Permiso denegado. Se requiere rol de Administrador." };
    }
}

export function verificarRol(req, rolRequerido) {
    const tokenResultado = verificarToken(req);

    if (tokenResultado.estado === false) {
        return tokenResultado; // Error de token (no provisto, inválido, expirado)
    }

    const rolUsuario = tokenResultado.payload.rol;
    const idUsuario = tokenResultado.payload.id; // 🟢 ¡EL ID del usuario autenticado!

    if (rolUsuario && rolUsuario.toLowerCase() === rolRequerido.toLowerCase()) {
        // Devuelve el estado OK y el ID del usuario para usarlo en la consulta
        return { estado: true, id: idUsuario, payload: tokenResultado.payload }; 
    } else {
        return { estado: false, error: `Permiso denegado. Se requiere rol de ${rolRequerido}.` };
    }
}


// Obtener usuarios
const obtenerUsuario = async (req, res) => {
    try{

        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const {id} = req.params
        const connection = await getConnection();
        const response = await connection.query("SELECT u.*,c.nombre as nombre_cobertura from usuario u left join cobertura c ON c.id = u.id_cobertura where u.id = ?",id);
        if(response.length == 1){
            res.json({codigo: 200, mensaje:"OK", payload: response})
        }
        else{
            res.json({codigo: -1, mensaje:"Usuario no encontrado", payload: []})
        }
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

//crear usuario
const crearUsuario = async (req, res) => {
    try{
        const {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono,
            id_cobertura
        } = req.body
         // 🛑 AHORA RE-ASIGNAMOS id_cobertura antes de crear el objeto
        if (id_cobertura === '' || id_cobertura === 0 || id_cobertura === 'null' || id_cobertura === undefined) {
            id_cobertura = null; // ¡Usamos la misma variable!
        }
        const usuario = {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono,
            id_cobertura
        }

        const connection = await getConnection();
        const response = await connection.query("INSERT INTO usuario set ?",usuario);
        res.json ({codigo: 200, mensaje: "Usuario añadido", payload: [{id_usuario: response.insertId}]});
    }
    catch(error){
        console.error("Error detallado de MySQL/MariaDB en crearUsuario:", error);
        
        let mensajeError = "Error desconocido al intentar registrar.";
        if (error.sqlMessage) {
             // Devolvemos el mensaje de error de SQL (ej: violación de FK)
             mensajeError = error.sqlMessage; 
        } else {
             mensajeError = error.message; // Error genérico de JS/conexión
        }
        
        res.status(500).json({ 
            codigo: 500, 
            mensaje: `Falló el registro: ${mensajeError}` 
        });
    }
}

//UPDATE (todos los campos)
const actualizarUsuario = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        
        const {id} = req.params;
        const {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono,
            id_cobertura
        } = req.body

        const usuario = {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono,
            id_cobertura
        }

        const connection = await getConnection();
        await connection.query("UPDATE usuario set ? where id = ?",[usuario,id])
        res.json ({codigo: 200, mensaje: "Usuario modificado", payload: []});
    }
    catch(error){
        res.status(500);
        res.send(error.message);
    }
}

//metodo para el administrador para que actualice un usuario
const actualizarUsuarioAdmin = async (req, res) => {
    try {
        // 🛑 1. VERIFICACIÓN DE PERMISOS DE ADMINISTRADOR 🛑
        const resultadoVerificarAdmin = verificarAdmin(req);
        if (resultadoVerificarAdmin.estado === false) {
            return res.status(403).json({ codigo: -1, mensaje: resultadoVerificarAdmin.error });
        }

        const {id} = req.params;
        const { 
            rol, 
            id_especialidad, 
            ...camposUsuario
        } = req.body
        // Desestructuramos el body, asegurándonos de que 'password' solo se actualice si existe.
        const usuarioParaUpdate = { ...camposUsuario };
        if (!usuarioParaUpdate.password) {
             delete usuarioParaUpdate.password;
        }

        const connection = await getConnection();
        
        // 2. Ejecutar el UPDATE en la tabla principal 'usuario'
        await connection.query("UPDATE usuario set ? where id = ?", [usuarioParaUpdate, id]);

        // 3. LÓGICA CLAVE: Actualizar la especialidad si es un médico
        if (rol && rol.toLowerCase() === 'medico') {
            
            // Si hay una nueva especialidad válida
            if (id_especialidad) { 
                // Usamos DELETE + INSERT para simplicidad (asumiendo 1 especialidad por médico)
                await connection.query("DELETE FROM medico_especialidad WHERE id_medico = ?", id);
                await connection.query("INSERT INTO medico_especialidad (id_medico, id_especialidad) VALUES (?, ?)", [id, id_especialidad]);
            } 
            // Si el id_especialidad es null o 0, eliminamos la asignación actual.
            else if (id_especialidad === null || id_especialidad === 0) {
                 await connection.query("DELETE FROM medico_especialidad WHERE id_medico = ?", id);
            }
        }
        
        res.json ({codigo: 200, mensaje: "Usuario modificado por Admin", payload: []});
    }
    catch(error){
        console.error("Error al actualizar usuario (Admin):", error);
        res.status(500);
        res.send(error.message);
    }
}

//metodo para el administrador para crear un usuario
const adminCrearUsuario = async (req, res) => {
    try {
        const resultadoVerificarAdmin = verificarAdmin(req);
        if (resultadoVerificarAdmin.estado === false) {
            return res.status(403).json({ codigo: -1, mensaje: resultadoVerificarAdmin.error });
        }
        console.log("adminCrearUsuario - req.body:", req.body);
        let {
            rol, // Necesario para la lógica de la especialidad
            id_especialidad, // Necesario para la lógica de la especialidad
            ...camposUsuario // Contiene todos los campos del usuario: dni, nombre, password, etc.
        } = req.body;

        rol = (rol || '').toString().toLowerCase();
        id_especialidad = id_especialidad ? Number(id_especialidad) : null;

        const usuarioParaInsertar = {
            ...camposUsuario, // Todos los datos de usuario
            rol                 // <-- ¡Añadimos el rol aquí!
        };
        
        if (!usuarioParaInsertar.dni || !usuarioParaInsertar.nombre || !usuarioParaInsertar.password || !usuarioParaInsertar.rol) {
           return res.status(400).json({ codigo: -1, mensaje: "Faltan campos obligatorios." });
        }
        // 2. Ejecutar el INSERT en la tabla principal 'usuario'
        const connection = await getConnection();
        const response = await connection.query("INSERT INTO usuario SET ?", usuarioParaInsertar);
        const idNuevoUsuario = response.insertId; // ID generado automáticamente

        if (rol === 'medico' && id_especialidad) {
            try {
                await connection.query(
                    "INSERT INTO medico_especialidad (id_medico, id_especialidad) VALUES (?, ?)",
                    [idNuevoUsuario, id_especialidad]
                );
            } catch (err) {
                console.error("Error insertando medico_especialidad:", err);
                return res.status(200).json({
                    codigo: 200,
                    mensaje: "Usuario creado pero falló asignación de especialidad.",
                    payload: [{ id_usuario: idNuevoUsuario }]
                });
            }
        }

        res.json ({codigo: 200, mensaje: "Usuario administrativo añadido y configurado.", payload: [{id_usuario: idNuevoUsuario}]});
    }
    catch(error){
        console.error("Error al crear usuario (Admin):", error);
        // Si hay un error de la base de datos (ej: DNI/Email duplicado), lo enviamos
        res.status(500).json({ 
            codigo: 500, 
            mensaje: `Falló la creación de usuario: ${error.sqlMessage || error.message}` 
        });
    }
}
// Esta funcion obtiene las especialidades asociadas a una cobertura específica y las devuelve en un formato adecuado para el Front-end.
const obtenerEspecialidadesPorCobertura = async (req, res) => {
    try {
        // Validación de token opcional, pero recomendada para rutas de API
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error});
        }
        
        const { id_cobertura } = req.params; // Capturamos el ID de la URL
        
        if (!id_cobertura) {
             return res.json({ codigo: -1, mensaje: "ID de cobertura no proporcionado", payload: [] });
        }
        
        const connection = await getConnection();
        
        // Consulta SQL para unir especialidades y la nueva tabla de relación
        const query = `
            SELECT 
                E.id, 
                E.descripcion AS nombre 
            FROM especialidad E
            JOIN cobertura_especialidad CE ON E.id = CE.id_especialidad
            WHERE CE.id_cobertura = ?
        `;
        
        const especialidades = await connection.query(query, [id_cobertura]);
        
        // Devolvemos el array de especialidades. Usamos 'nombre' como alias para el Front-end
        res.json({ codigo: 200, mensaje: "OK", payload: especialidades });
    } catch (error) {
        console.error("Error al obtener especialidades por cobertura:", error);
        res.status(500).send(error.message);
    }
};

//Buscar paciente
const buscarPacientes = async (req, res) => {
    let connection;
    try {
        // La búsqueda se enviará en el cuerpo de la solicitud POST
        const { termino } = req.body; 

        if (!termino || termino.length < 3) {
            return res.json({ codigo: 1, mensaje: "Debe ingresar al menos 3 caracteres para buscar.", payload: [] });
        }

        // (%) para buscar coincidencias parciales en DNI, Nombre o Apellido.
        const terminoBusqueda = `%${termino}%`;

        const query = `
            SELECT 
                u.id, 
                u.dni, 
                CONCAT(u.apellido, ', ', u.nombre) AS nombre_completo,
                u.id_cobertura
            FROM 
                usuario u
            WHERE 
                u.rol = 'paciente' AND
                (u.dni LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ?)
            LIMIT 10;
        `;

        // Se pasa el término de búsqueda tres veces para cada condición LIKE
        connection = await getConnection();
        const response = await connection.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda]);

        res.json({ codigo: 200, mensaje: "Búsqueda exitosa", payload: response });

    } catch (error) {
        console.error("Error en buscarPacientes:", error);
        res.status(500).send({ codigo: 500, mensaje: "Error del servidor al buscar pacientes." });
    } finally {
        // Aquí podrías manejar el cierre de la conexión si tu patrón lo requiere
    }
};

// const eliminarUsuario = async (req, res) => {
    
//     try {
//         const resultadoVerificarAdmin = verificarAdmin(req);
//         if (resultadoVerificarAdmin.estado === false) {
//             return res.status(403).json({ codigo: -1, mensaje: resultadoVerificarAdmin.error });
//         }
        
//         const { id } = req.params;
//         const connection = await getConnection();

//         const usuarioEncontrado = await connection.query('SELECT rol FROM usuario WHERE id = ?', [id]);
        
//         // const usuarioEncontrado = filas[0]; 
        
//         if (!usuarioEncontrado) {
//             // Este es el caso 404 que buscabas.
//             return res.status(404).json({ codigo: -1, message: 'Usuario no encontrado' });
//         }

//         const rol = usuarioEncontrado.rol;

//         // 2. Si es médico, eliminar relaciones de especialidad
//         if (rol === 'medico') {
//             await connection.query('DELETE FROM medico_especialidad WHERE id_medico = ?', [id]);
//         }
        
//         // 3. Eliminar usuario
//         // Verificamos si la eliminación tuvo éxito
//         const response = await connection.query('DELETE FROM usuario WHERE id = ?', [id]);

//         if (response.affectedRows === 0) {
//             // Esto solo ocurre si el usuario fue eliminado entre el select y este delete (caso raro)
//             return res.status(404).json({ codigo: -1, message: 'Usuario no encontrado para eliminar.' });
//         }

//         res.json({ codigo: 200, message: 'Usuario eliminado correctamente' });
//     } catch (error) {
//         console.error('Error al eliminar usuario:', error);
//         // Devolvemos el mensaje de error de SQL/DB si existe.
//         res.status(500).json({ 
//             codigo: 500,
//             message: `Error al eliminar usuario: ${error.sqlMessage || error.message}` 
//         });
//     }
// };

export const methods = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    obtenerUsuario,
    obtenerEspecialidadesPorCobertura,
    actualizarUsuarioAdmin,
    adminCrearUsuario,
    buscarPacientes
    // eliminarUsuario
};