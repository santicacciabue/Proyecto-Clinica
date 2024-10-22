import express from "express";
import morgan from "morgan";
import cors from "cors";

//Routes
import usuarioRoutes from "./routes/usuario.routes";
import loginRoutes from "./routes/login.routes"
import agendaRoutes from "./routes/agenda.routes"
import turnoRoutes from "./routes/turno.routes";
import especialidadRoutes from "./routes/especialidad.routes"

const app = express();

app.use(cors());

//Settings
app.set("port", 4000);

//Middlewares
app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api",usuarioRoutes);
app.use("/api",loginRoutes);
app.use("/api",agendaRoutes);
app.use("/api",turnoRoutes);
app.use("/api",especialidadRoutes);

export default app;