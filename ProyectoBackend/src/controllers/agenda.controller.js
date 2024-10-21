import { getConnection } from "./../database/database";

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
        // res.json({codigo: 200, mensaje: "OK", payload:  response});
        if(response){
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

const modificarAgenda = async (req, res) => {
    try{
        const { id } = req.params
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
        const response = await connection.query("UPDATE agenda SET ? where id = ?",[registroAgenda,id]);
        res.json({codigo: 200, mensaje: "OK", payload:  response});
    }
    catch(error){
            res.status(500);
            res.send(error.message);
    }



    
}

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



export const methods = {
    obtenerAgenda,
    crearAgenda,
    modificarAgenda
}