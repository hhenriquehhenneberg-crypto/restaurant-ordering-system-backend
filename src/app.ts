import express from "express";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  return res.json({
    project: "Restaurant Ordering System",
    status: "online",
    routes: ["GET /categories", "POST /categories", "GET /products", "POST /products"],
  });
});

app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);

app.use((_req, res) => {
  return res.status(404).json({ message: "Rota não encontrada" });
});

export default app;
