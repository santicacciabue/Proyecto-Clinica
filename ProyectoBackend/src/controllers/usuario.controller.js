import { getConnection } from "./../database/database";
const jwt = require ("jsonwebtoken");
const secret = process.env.SECRET
// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
    try{
        
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("SELECT u.*,c.nombre as nombre_cobertura from usuario u left join cobertura c ON c.id = u.id_cobertura");
        res.json({codigo: 200, mensaje: "OK", payload:  response});
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

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
        return {estado: true};
    }
    catch(error){
        return {estado: false, error: "Token inválido"}
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
        res.status(500);
        res.send(error.message);
    }
}

//UPDATE (todos los campos)
const actualizarUsuario = async (req, res) => {
    try{
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        console.log(req.params);
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

export const methods = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    obtenerUsuario,
    obtenerEspecialidadesPorCobertura,
};