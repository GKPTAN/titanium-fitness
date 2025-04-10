import postgres from 'postgres';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// const __filename = new URL(import.meta.url).pathname;
// const __dirnamel = path.dirname(__filename)

dotenv.config({ path: path.resolve(".env") });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL não definida no .env!");
};

const sql = postgres(connectionString, {
    ssl: "require"
});

console.log("Conectado ao Banco de dados");

if (!sql) {
    console.log("falha ao se conectar ao banco de dados");
};

export default sql;