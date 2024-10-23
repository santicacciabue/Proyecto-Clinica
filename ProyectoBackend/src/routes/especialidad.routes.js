import { Router } from "express";
import { methods as especialidadController} from "../controllers/especialidad.controller";

const router = Router();

router.get("/obtenerEspecialidadesMedico/:id_medico", especialidadController.obtenerEspecialidadesMedico);
router.get("/obtenerMedicoPorEspecialidad/:id_especialidad", especialidadController.obtenerMedicoPorEspecialidad);
router.get("/obtenerEspecialidades", especialidadController.obtenerEspecialidades);
router.post("/crearMedicoEspecialidad", especialidadController.crearMedicoEspecialidad);
router.get("/obtenerCoberturas",especialidadController.obtenerCoberturas)

export default router;