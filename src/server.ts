import "dotenv/config";
import app from "./app";
import { database } from "./database/connection";

const port = Number(process.env.PORT ?? 3000);
async function start() {
  try {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("PORT deve estar entre 1 e 65535.");
    }
    if (!process.env.ADMIN_API_KEY || process.env.ADMIN_API_KEY.length < 24) {
      throw new Error("Defina ADMIN_API_KEY com pelo menos 24 caracteres antes de iniciar.");
    }
    await database.query("select 1");
    app.listen(port, () => console.log("API iniciada na porta " + port));
  } catch (error) {
    console.error("Falha na inicialização:", error);
    await database.end();
    process.exitCode = 1;
  }
}
start();
