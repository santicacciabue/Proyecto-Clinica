import { getConnection } from "./../database/database";

//crear usuario
const login = async (req, res) => {
    try{
        const {
            usuario,
            password
        } = req.body
        // const cuerpo = {
        //     usuario,
        //     password
        // }

        const connection = await getConnection();
        const respuesta = await connection.query("SELECT id FROM usuario WHERE usuario = ? AND password = ?", [usuario, password]);
        console.log(respuesta);
        if(respuesta.length > 0){
            console.log("se encontro el usuario")
            res.json({codigo: 200, mensaje: "OK", payload: respuesta});
        }
        else{
            console.log("usuario no encontrado")
        }
        // res.json ({codigo: 200, mensaje: "Usuario añadido", payload: []});
    }
    catch(error){
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