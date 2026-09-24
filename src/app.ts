import express, { type ErrorRequestHandler } from "express";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.get("/", (_req, res) => res.json({
  project: "Restaurant Ordering System", version: "1.1.0",
  resources: ["/categories", "/products"]
}));
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use((_req, res) => res.status(404).json({ message: "Rota não encontrada." }));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    res.status(413).json({ message: "Corpo da requisição muito grande." });
  } else if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ message: "JSON inválido." });
  } else {
    console.error("Erro não tratado:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
app.use(errorHandler);
export default app;
