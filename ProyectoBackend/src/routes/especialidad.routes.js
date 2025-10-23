import { Router } from "express";
import { methods as especialidadController} from "../controllers/especialidad.controller";


const router = Router();

router.get("/obtenerEspecialidadesMedico/:id_medico", especialidadController.obtenerEspecialidadesMedico);
router.get("/obtenerMedicoPorEspecialidad/:id_especialidad", especialidadController.obtenerMedicoPorEspecialidad);
router.get("/obtenerEspecialidades", especialidadController.obtenerEspecialidades);
router.post("/crearMedicoEspecialidad", especialidadController.crearMedicoEspecialidad);

// 2. Rutas del ADMINISTRADOR (CRUD)
// Estas deben estar protegidas con verificarAdmin

// La ruta raíz '/' aquí se mapeará a /api/admin/especialidades
router.get("/", especialidadController.obtenerEspecialidades);
router.get("/:id/coberturas", especialidadController.obtenerCoberturasPorEspecialidad);
router.post("/", especialidadController.crearEspecialidad);
router.put("/:id", especialidadController.actualizarEspecialidad);
router.delete("/:id", especialidadController.eliminarEspecialidad);

// Asociar nuevas coberturas a una especialidad existente
router.post("/:id/asociar", especialidadController.asociarCoberturas); 

// Obtener las coberturas NO asociadas (para el select de asociación)
router.get("/:id/coberturas/no-asociadas", especialidadController.obtenerCoberturasNoAsociadas);

//para el operador
router.get("/obtenerEspecialidadesPorCobertura", especialidadController.obtenerEspecialidadesPorCobertura);


export default router;