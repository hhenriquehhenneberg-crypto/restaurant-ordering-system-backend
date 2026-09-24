import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { requireAdmin } from "../middleware/admin";

const routes = Router();
const controller = new ProductController();

routes.get("/", (req, res) => controller.list(req, res));
routes.get("/:id", (req, res) => controller.get(req, res));
routes.post("/", requireAdmin, (req, res) => controller.create(req, res));
routes.put("/:id", requireAdmin, (req, res) => controller.update(req, res));
routes.delete("/:id", requireAdmin, (req, res) => controller.remove(req, res));
export default routes;
