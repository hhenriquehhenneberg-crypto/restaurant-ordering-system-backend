import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";

const categoryRoutes = Router();
const controller = new CategoryController();

categoryRoutes.get("/", (req, res) => controller.list(req, res));
categoryRoutes.post("/", (req, res) => controller.create(req, res));

export default categoryRoutes;
