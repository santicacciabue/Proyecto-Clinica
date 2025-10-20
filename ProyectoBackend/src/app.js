import express from "express";
import morgan from "morgan";
import cors from "cors";

//Routes
import usuarioRoutes from "./routes/usuario.routes";
import loginRoutes from "./routes/login.routes"
import agendaRoutes from "./routes/agenda.routes"
import turnoRoutes from "./routes/turno.routes";

import especialidadesPublicasRoutes from "./routes/especialidad.routes";

const coberturasAdminRoutes = require('./routes/coberturas.routes');

const especialidadesAdminRoutes = require('./routes/especialidad.routes');

const app = express();

app.use(cors());

//Settings
app.set("port", 4000);

//Middlewares
app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api/usuarios", usuarioRoutes.default || usuarioRoutes);
app.use("/api/admin/usuarios", usuarioRoutes.default || usuarioRoutes); //Ruta Admin
app.use("/api", loginRoutes.default || loginRoutes);
app.use("/api", agendaRoutes.default || agendaRoutes);
app.use("/api", turnoRoutes.default || turnoRoutes);

app.use('/api', especialidadesPublicasRoutes.default || especialidadesPublicasRoutes);
app.use('/api', coberturasAdminRoutes); 
app.use('/api/admin/coberturas', coberturasAdminRoutes); 
app.use('/api/admin/especialidades', especialidadesAdminRoutes.default || especialidadesAdminRoutes);

export default app;