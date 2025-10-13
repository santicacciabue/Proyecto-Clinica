import { getConnection } from "./../database/database";
const jwt = require ("jsonwebtoken");
const secret = process.env.SECRET
//crear usuario
const login = async (req, res) => {
    try{
        const { usuario, password } = req.body
        const connection = await getConnection();
        
        // Esta consulta SQL busca un usuario que coincida con el DNI y la contraseña proporcionados
        // y obtiene también información relacionada de la tabla 'cobertura' mediante un LEFT JOIN.
        const respuesta = await connection.query(
            `SELECT 
                U.id, U.nombre, U.apellido, U.rol, U.id_cobertura,
                C.nombre AS nombre_cobertura
            FROM usuario U
            LEFT JOIN cobertura C ON C.id = U.id_cobertura
            WHERE U.dni = ? AND U.password = ?`, 
            [usuario, password]
        );
        
        // VERIFICACIÓN CLAVE: Si se encontró al menos una fila (el usuario)
        if(respuesta.length > 0){
            const datosUsuario = respuesta[0]; // Tomamos la primera (y única) fila
            
            // CREACIÓN DEL PAYLOAD DEL JWT DENTRO DE LA VERIFICACIÓN
            const payload = {
                id: datosUsuario.id, 
                rol: datosUsuario.rol,
                id_cobertura: datosUsuario.id_cobertura,
                nombre: datosUsuario.nombre, 
                apellido: datosUsuario.apellido,
                nombre_cobertura: datosUsuario.nombre_cobertura,
            };

            const token = jwt.sign(payload, secret, { expiresIn: '8h' });
            
            console.log("se encontro el usuario");
            
            // RESPUESTA DE ÉXITO
            res.json({
                codigo: 200, 
                mensaje: "OK", 
                payload: respuesta, 
                jwt: token
            });
        }
        else{
            // RESPUESTA DE ERROR (Usuario no encontrado)
            console.log("usuario no encontrado");
            res.json({codigo: -1, mensaje: "Usuario o contraseña incorrecta", payload: []});
        }
    }
    catch(error){
        console.error("ERROR EN LOGIN:", error); 
        res.status(500);
        res.send(error.message);
    }
}

const resetearPassword = async(req, res) => {
    try{
        const { id } = req.params
        const {
            password
        } = req.body
        const connection = await getConnection();
        const respuesta = await connection.query("UPDATE usuario set password = ? where id = ?", [password, id]);
        if(respuesta.affectedRows == 1){
            res.json({codigo: 200, mensaje:"Contraseña restablecida", payload: []})
        }
        else{
            res.json({codigo: -1, mensaje:"Usuario no encontrado", payload: []})
        }
        console.log(respuesta);
    }
    catch(error){
        res.status(500);
        res.send(error.message);
    }
}


export const methods = {
    login,
    resetearPassword
};