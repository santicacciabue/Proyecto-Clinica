import { Router } from "express";
import { methods as loginController} from "./../controllers/login.controller";

const router = Router();

router.post("/login", loginController.login);
router.put("/resetearPassword/:id", loginController.resetearPassword);


export default router;