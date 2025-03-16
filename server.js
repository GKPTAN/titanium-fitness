import express from 'express';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ipFetch from './src/axios/config.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getEmailTemplate(name, codeConfirm, location) {
    try {
        const filePath = path.join(__dirname, 'src/pages/email.html');
        let emailTemplate = await fs.readFile(filePath, 'utf-8');

        emailTemplate = emailTemplate
        .replace('{{name}}', name)
        .replace('{{codeConfirm}}', codeConfirm)
        .replace('{{city}}', location.city)        
        .replace('{{region}}', location.region);

        return emailTemplate;
    } catch (error) {
        console.error('Erro ao carregar o template de e-mail: ', error);
        return '';
    };
};

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:5500"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Função para validar os dados manualmente
const validarInput = (name, age, gender, email, senha, passwordConfirm) => {
    const validGenders = ["Masculino", "Feminino"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (typeof name !== 'string') {
        return "ERROR_STRING_VALUE: O valor do campo 'nome' tem que ser do tipo string";
    }

    if (!Number.isInteger(age)) {
        return "ERROR_VALIDATE_INT: O valor do campo 'idade' deve ser um número inteiro!";
    }

    if (!validGenders.includes(gender)) {
        return "ERROR_VALIDATE_GENDER: O gênero informado não é válido!";
    }

    if (!emailRegex.test(email)) {
        return "ERROR_EMAIL_FORMAT: Formato de e-mail inválido!";
    }

    if (!name || !age || !gender || !email || !senha || !passwordConfirm) {
        return "ERROR_EMPTY_INPUT: Nenhum campo pode estar vazio!";
    }

    if (name.length < 3) {
        return "ERROR_SIZE_REQUIRED: O campo 'nome' precisa ter no mínimo 3 caracteres!";
    }

    if (senha.length < 6 || passwordConfirm.length < 6) {
        return "ERROR_SIZE_REQUIRED: A senha precisa ter no mínimo 6 caracteres!";
    }

    if (senha.length > 15 || passwordConfirm.length > 15) {
        return "ERROR_SIZE_REQUIRED: A senha pode ter no máximo 15 caracteres!";
    }

    if (age < 12 || age > 100) {
        return "ERROR_INVALID_AGE: Idade inválida, não temos suporte para essa idade!";
    }

    if (name.length > 255 || email.length > 255) {
        return "ERROR_SIZE_REQUIRED: O campo 'nome' e 'email' podem ter no máximo 255 caracteres!";
    }

    if (name.trim() === '' || String(age).trim() === '') {
        return "ERROR_SPACE_ZERO: O campo não pode conter apenas espaços!";
    }

    if (senha.includes(' ') || passwordConfirm.includes(' ')) {
        return "ERROR_SPACE_ZERO: O campo 'senha' não pode conter espaços!";
    }

    if (/\s{3,}/.test(name)) {
        return "ERROR_SPACE_BETWEEN: O nome não pode conter mais de dois espaços seguidos!";
    }

    if (/^\d+$/.test(name)) {
        return "ERROR_TYPE_DIGIT: O campo 'nome' deve conter letras, não apenas números!";
    }

    if (senha !== passwordConfirm) {
        return "ERROR_PASSWORD_CONFIRM: As senhas não coincidem!";
    }

    return true;
};

let db;

async function connectDB() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Conectado ao banco de dados!');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1); // Encerra o servidor caso não consiga conectar ao banco
    };
};

connectDB();

const generateCodeConfirm = () => Math.floor(100000 + Math.random() * 900000);

const codeConfirm = generateCodeConfirm();

async function getUserLocation(ip) {
    try {
        const response = await ipFetch.get(`/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
        const data = response.data;
        return {
            city: data.city || "Localização indisponível",
            region: data.region || "Localização indisponível",
            country: data.country || "Localização indisponível",
            loc: data.loc || "Localização indisponível",
        };
    } catch (error) {
        console.error("Localização indisponível");
        return {city: "Localização indisponível", region: "Localização indisponível", country: "Localização indisponível", loc: "Localização indisponível"}
    };
};

// Rota para receber os dados do formulário
app.post('/registro', [
    check('names').isString().trim().isLength({ min: 3, max: 255 }),
    check('ages').isInt({ min: 12, max: 100 }),
    check('genres').isIn(["Masculino", "Feminino"]),
    check('emails').isEmail().matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
    check('password_user').isLength({ min: 6, max: 15 }).not().contains(' '),
    check('password_conf').isLength({ min: 6, max: 15 }).not().contains(' '),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    };

    const { names, ages, genres, emails, password_user, password_conf } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = await getUserLocation(ip);

    const validacao = validarInput(names, ages, genres, emails, password_user, password_conf);
    if (validacao !== true) {
        return res.status(400).json({ error: [{ msg: validacao }] });
    };

    try {
        const sqlmail = `SELECT * FROM users WHERE email = ?`;
        const [results] = await db.execute(sqlmail, [emails]); // Use db.execute para aguardar a consulta

        const [resultsUnverifieds] = await db.execute("SELECT * FROM unverified_users WHERE email = ?", [emails]);

        if (results.length > 0 || resultsUnverifieds > 0) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado!'});
        };

        // Se o e-mail não existir, o fluxo continua normalmente
        console.log("Email disponível");
    } catch (error) {
        console.error("Erro ao buscar dados: ", error);
        res.json({message: 'Erro no servidor'});
    };

    if (location.country !== "Localização indisponível") {
        if (location.country !== "BR") {
            return res.status(400).json({
                message: "Somente pessoas que vivem no Brasil tem acesso a esse site!",
            });
        };
    };

    try {
        const hashPassword = await bcrypt.hash(password_user, 10);
        const creationDate = new Date().toLocaleDateString('pt-BR');
        const creationHour = new Date().toLocaleTimeString('pt-BR');

        const sql = `INSERT INTO unverified_users (name, age, gender, email, password, confirm_code, date, hours, ip, city, region, country, location) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        await db.execute(sql, [names, ages, genres, emails, hashPassword, codeConfirm, creationDate, creationHour, ip, location.city, location.region, location.country, location.loc]);

        await main(req);

        const [user] = await db.execute("SELECT id FROM unverified_users WHERE email = ?", [emails]);

        if (user.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        };

        const userId = user[0].id;

        console.log("id do usuário: ", userId);

        res.cookie("user_id", userId, {
            httpOnly: true, 
            secure: true,
            sameSite: "Strict",
            maxAge: 12 * 60 * 60 * 1000
        });

        res.status(200).json({ 
            message: "Cadastro realizado com sucesso.",
            redirectUrl: "/src/pages/confirm_email.html"
        });
    } catch (error) {
        console.error("Erro ao registrar usuário: ", error);
        res.status(500).json({message: 'Erro interno no servidor'});
    };
});

app.post('/verification', async (req, res) => {
    const { code, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "tempo de verificação expirado!" });
    };

    try {
        const [user] = await db.execute("SELECT * FROM unverified_users WHERE id = ? AND confirm_code = ?", [userId, code]);

        if (user.length === 0) {
            return res.status(400).json({ message: "Código inválido ou expirado." });
        };

        await db.execute("UPDATE unverified_users SET verificado = 1 WHERE id = ?", [userId]);

        await db.execute("INSERT INTO users (name, age, gender, email, password, verificado, date, hours, ip, city, region, country, location) SELECT name, age, gender, email, password, date, hours, ip, city, region, country, location, NOW() FROM unverified_users WHERE id = ?", [userId]);

        await db.execute("DELETE FROM unverified_users WHERE id = ?", [userId]);

        res.clearCookie("user_id");

        res.status(200).json({ 
            message: "E-mail verificado com sucesso!", 
            redirectUrl: "/src/pages/login.html",
        });
    } catch (error) {
        console.error("Erro ao verificar código:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    };
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_PASS,
    },
});

async function main(req) {

    const {names, emails} = req.body;

    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = await getUserLocation(userIp);
    const emailTemplate = await getEmailTemplate(names, codeConfirm, location);

    const info = await transporter.sendMail({
        from: `"Academia Titanium Fitness" <${process.env.USER_MAIL}>`,
        to: emails,
        subject: "Código de Confirmação",
        text: `Olá ${names}, agradecemos por se cadastrar na nossa academia. Para ter acesso a sua conta, você precisa verificar seu e-mail com esse código de verificação que enviamos para você. Digite esse código na página de verificação: ${codeConfirm}
        
        📍 Localização do pedido de registro:
        - Cidade: ${location.city}
        - Estado: ${location.region}

        ⚠️ Atenção: 
        - Não compartilhe este código. 
        - Nunca pediremos códigos por e-mail ou telefone.
        - Se você não solicitou este registro, ignore esta mensagem.`,
        html: emailTemplate,
    });

    console.log("e-mail enviado para: ", emails);
    console.log("e-mail enviado: ", info.messageId);
}

main().catch(console.error);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});