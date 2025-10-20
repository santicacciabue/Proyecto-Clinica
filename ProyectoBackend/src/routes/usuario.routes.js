import { Router } from "express";
import { methods as usuarioController} from "./../controllers/usuario.controller";

const router = Router();

// router.delete('/:id', usuarioController.eliminarUsuario);
router.get("/obtenerEspecialidadesPorCobertura/:id_cobertura", usuarioController.obtenerEspecialidadesPorCobertura);  //NUEVA RUTA para obtener especialidades por cobertura
router.post("/crearUsuario",usuarioController.crearUsuario);
router.post("/admin", usuarioController.adminCrearUsuario);
router.put("/:id",usuarioController.actualizarUsuario);
router.put("/admin/:id", usuarioController.actualizarUsuarioAdmin);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/:id", usuarioController.obtenerUsuario);

export default router;