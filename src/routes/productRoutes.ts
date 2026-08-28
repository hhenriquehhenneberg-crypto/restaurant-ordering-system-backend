import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const productRoutes = Router();
const controller = new ProductController();

productRoutes.get("/", (req, res) => controller.list(req, res));
productRoutes.post("/", (req, res) => controller.create(req, res));

export default productRoutes;
