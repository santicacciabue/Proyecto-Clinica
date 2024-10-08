import { config } from "dotenv";


config();
//pone a disposicion las variables de entorno que hayamos configurado en .env 

export  default{
    host: process.env.HOST,
    database: process.env.DATABASE,
    user:process.env.USER || "",
    password: process.env.PASSWORD
}