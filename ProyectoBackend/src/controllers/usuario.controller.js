import { getConnection } from "./../database/database";
const secret = process.env.secret;
const jwt = require ("jsonwebtoken");
// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
    try{
        
        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const connection = await getConnection();
        const response = await connection.query("SELECT * from usuario");
        res.json({codigo: 200, mensaje: "OK", payload:  response});
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
    console.log("paso")
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

// Obtener usuarios
const obtenerUsuario = async (req, res) => {
    try{

        const resultadoVerificar = verificarToken(req);
        if(resultadoVerificar.estado == false){
            return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        }
        const {id} = req.params
        const connection = await getConnection();
        const response = await connection.query("SELECT * from usuario where id = ?",id);
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
        // const resultadoVerificar = verificarToken(req);
        // if(resultadoVerificar.estado == false){
        //     return res.send({codigo: -1, mensaje: resultadoVerificar.error})
        // }
        const {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono
        } = req.body

        const usuario = {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono
        }

        const connection = await getConnection();
        const response = await connection.query("INSERT INTO usuario set ?",usuario)
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
            telefono
        } = req.body

        const usuario = {
            dni,
            apellido,
            nombre,
            fecha_nacimiento,
            password,
            rol,
            email,
            telefono
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



export const methods = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    obtenerUsuario
};