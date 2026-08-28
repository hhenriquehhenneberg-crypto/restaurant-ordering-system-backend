import "dotenv/config";
import app from "./app";
import { database } from "./database/connection";

const port = Number(process.env.PORT ?? 3000);

async function start() {
  try {
    await database.query("select 1");

    app.listen(port, () => {
      console.log(`API rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
    process.exit(1);
  }
}

start();
