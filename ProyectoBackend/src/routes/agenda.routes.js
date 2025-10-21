import { Router } from "express";
import { methods as agendaController} from "../controllers/agenda.controller";

const router = Router();

router.get("/obtenerAgenda/:id_medico", agendaController.obtenerAgenda);
router.post("/crearAgenda", agendaController.crearAgenda);
router.put("/modificarAgenda/:id",agendaController.modificarAgenda);
// (GET /api/agenda/horarios-medico/:id_medico?fecha=...)
router.get("/horarios-medico/:id_medico", agendaController.obtenerHorariosMedico);

// (DELETE /api/agenda/eliminar-horario/:id)
router.delete("/eliminar-horario/:id", agendaController.eliminarHorarioAgenda); 

// (GET /api/agenda/medicos-abiertos?fecha=...)
router.get("/medicos-abiertos", agendaController.obtenerMedicosConAgendaAbierta);

router.post("/crear-mi-agenda", agendaController.crearMiAgenda);

export default router;