import { Router } from "express";
import { methods as agendaController} from "../controllers/agenda.controller";

const router = Router();

router.get("/obtenerAgenda/:id_medico", agendaController.obtenerAgenda);
router.post("/crearAgenda", agendaController.crearAgenda);
router.put("/modificarAgenda/:id",agendaController.modificarAgenda)

export default router;