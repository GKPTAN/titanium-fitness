import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startHttpsServer = async (app, PORT) => {
    try {
        const key = await fs.readFile(path.join(__dirname, "../../certificates/key.pem"));
        const cert = await fs.readFile(path.join(__dirname, "../../certificates/cert.pem"));
        // const certSupabase = await fs.readFile(path.join(__dirname, "../certificates/prod-ca-2021.crt"));
    
        const options = { key, cert };
    
        https.createServer(options, app).listen(PORT, () => {
            console.log(`Servidor HTTPS rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error("Erro ao criar servidor https: ", error);
    };
};

export default startHttpsServer;