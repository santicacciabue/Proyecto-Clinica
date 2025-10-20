// backend/routes/coberturas.routes.js
const { Router } = require("express");
const router = Router();
const coberturasController = require("../controllers/coberturas.controller");


// Mapeo de las URLs
router.get("/obtenerCoberturas", coberturasController.obtenerCoberturas);
router.post("/", coberturasController.crearCobertura);
router.put("/:id", coberturasController.actualizarCobertura);
router.delete("/:id", coberturasController.eliminarCobertura);

module.exports = router;