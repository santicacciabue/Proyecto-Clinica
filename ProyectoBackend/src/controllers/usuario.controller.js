import { getConnection } from "./../database/database";

// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
    try{
        const connection = await getConnection();
        const response = await connection.query("SELECT * from usuario");
        res.json({codigo: 200, mensaje: "OK", payload:  response});
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }
}

// Obtener usuarios
const obtenerUsuario = async (req, res) => {
    try{
        const {id} = req.params
        const connection = await getConnection();
        const response = await connection.query("SELECT * from usuario where id = ?",id);
        res.json({codigo: 200, mensaje: "OK", payload:  response});
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
        await connection.query("INSERT INTO usuario set ?",usuario)
        res.json ({codigo: 200, mensaje: "Usuario añadido", payload: []});
    }
    catch(error){
        res.status(500);
        res.send(error.message);
    }
}

//UPDATE (todos los campos)
const actualizarUsuario = async (req, res) => {
    try{
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