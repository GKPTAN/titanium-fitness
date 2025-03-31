import postgres from 'postgres';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve("../.env.development.local") });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL não definida no .env!");
};

const sql = postgres(connectionString);

console.log("Conectado ao Banco de dados");

if (!sql) {
    console.log("falha ao se conectar ao banco de dados");
};

export default sql;