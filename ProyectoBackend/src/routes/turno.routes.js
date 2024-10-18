import { Router } from "express";
import { methods as turnoController} from "./../controllers/turno.controller";

const router = Router();

router.get("/obtenerTurnoPaciente/:id", turnoController.obtenerTurnoPaciente);
router.post("/obtenerTurnosMedico", turnoController.obtenerTurnosMedico);
router.post("/asignarTurnoPaciente", turnoController.asignarTurnoPaciente);
router.put("/actualizarTurnoPaciente/:id",turnoController.actualizarTurnoPaciente);
router.delete("/eliminarTurnoPaciente/:id",turnoController.eliminarTurnoPaciente);
export default router;