import { Router } from "express";
import { methods as turnoController} from "./../controllers/turno.controller";

const router = Router();

router.get("/obtenerTurnoPaciente/:id", turnoController.obtenerTurnoPaciente);
router.get("/obtenerTurnosMedico/:id_medico/:fecha", turnoController.obtenerTurnosMedico);

export default router;