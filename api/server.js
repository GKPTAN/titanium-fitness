import express from "express";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import cors from "cors";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ipFetch from "../src/axios/config.js";
import cookieParser from "cookie-parser";
import https from "https";
import sql from "../db.js";

dotenv.config({ path: path.resolve("../.env.development.local") });

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "https://gkptan.github.io",
      "https://titanium-fitness.vercel.app/",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Internal Server Error"
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getEmailTemplate(name, codeConfirm, location) {
  try {
    const emailVerify = path.join(__dirname, "../src/templates/email.html");
    const emailAcessVerify = path.join(__dirname, "../src/templates/email_acess.html");

    let emailVerifyTemplate = await fs.readFile(emailVerify, "utf-8");
    let emailAcessVerifyTemplate = await fs.readFile(emailAcessVerify, "utf-8");

    emailVerifyTemplate = emailVerifyTemplate
      .replace("{{name}}", name)
      .replace("{{codeConfirm}}", codeConfirm)
      .replace("{{city}}", location.city)
      .replace("{{region}}", location.region);

    emailAcessVerifyTemplate = emailAcessVerifyTemplate
      .replace("{{name}}", name)
      .replace("{{city}}", location.city)
      .replace("{{region}}", location.region)

    return { emailVerifyTemplate, emailAcessVerifyTemplate };
  } catch (error) {
    console.error("Erro ao carregar o template de e-mail: ", error);
    return "";
  }
}

// Função para validar os dados manualmente
const validarInput = (name, age, gender, email, senha, passwordConfirm) => {
  const validGenders = ["Masculino", "Feminino"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (typeof name !== "string") {
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

  if (name.trim() === "" || String(age).trim() === "") {
    return "ERROR_SPACE_ZERO: O campo não pode conter apenas espaços!";
  }

  if (senha.includes(" ") || passwordConfirm.includes(" ")) {
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
    return {
      city: "Localização indisponível",
      region: "Localização indisponível",
      country: "Localização indisponível",
      loc: "Localização indisponível",
    };
  }
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PASS,
    },
});

// Rota para receber os dados do formulário
app.post("/api/registro", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { names, ages, genres, emails, password_user, password_conf } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const location = await getUserLocation(ip);

  const validacao = validarInput(
    names,
    ages,
    genres,
    emails,
    password_user,
    password_conf
  );
  if (validacao !== true) {
    return res.status(400).json({ error: [{ msg: validacao }] });
  }

  try {
    const results = await sql`SELECT * FROM users WHERE email = ${emails}`;
    const resultsUnverifieds = await sql`SELECT * FROM unverified_users WHERE email = ${emails}`;

    if (results?.length > 0 || resultsUnverifieds?.length > 0) {
      return res.status(400).json({ message: "Este e-mail já está cadastrado!" });
    };

    // Se o e-mail não existir, o fluxo continua normalmente
    console.log("Email disponível");
  } catch (error) {
    console.error("Erro ao buscar dados: ", error);
    res.status(500).json({ message: "Erro no servidor" });
  }

  if (location.country !== "Localização indisponível") {
    if (location.country !== "BR") {
      return res.status(400).json({
        message: "Somente pessoas que vivem no Brasil tem acesso a esse site!",
      });
    };
  };

  try {
    const hashPassword = await bcrypt.hash(password_user, 10);

    const sqlInsert = sql`INSERT INTO unverified_users (name, age, gender, email, password, confirm_code, ip, city, region, country, location) VALUES (${names},${ages},${genres},${emails},${hashPassword},${codeConfirm},${ip},${location.city},${location.region},${location.country},${location.loc})`;

    await sqlInsert;

    await main(emails, names, location);

    const user = await sql`SELECT id FROM unverified_users WHERE email = ${emails}`;

    if (user?.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const userId = user[0].id;

    console.log("id do usuário: ", userId);

    res.cookie("user_id", userId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Cadastro realizado com sucesso.",
      redirectUrl: "/titanium-fitness/src/pages/confirm_email.html",
    });
  } catch (error) {
    console.error("Erro ao registrar usuário: ", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

app.get("/api/user-id", (req, res) => {
  const userId = req.cookies.user_id;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  res.json({ userId });
});

app.post("/api/verification", async (req, res) => {
  const { code, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "tempo de verificação expirado!" });
  }

  try {
    const user = await sql`SELECT * FROM unverified_users WHERE id = ${userId} AND confirm_code = ${code}`;

    if (user?.length === 0) {
      return res.status(400).json({ message: "Código inválido ou expirado." });
    }

    await sql`UPDATE unverified_users SET verificado = 1 WHERE id = ${userId}`;

    await sql`INSERT INTO users (name, age, gender, email, password, verificado, ip, city, region, country, location) SELECT name, age, gender, email, password, 1, ip, city, region, country, location FROM unverified_users WHERE id = ${userId}`;

    await sql`DELETE FROM unverified_users WHERE id = ${userId}`;

    res.clearCookie("user_id");

    res.status(200).json({
      message: "E-mail verificado com sucesso!",
      redirectUrl: "/titanium-fitness/src/pages/login.html",
    });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email_user, password_user } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const results = await sql`SELECT * FROM unverified_users WHERE email = ${email_user}`;
    if (results?.length > 0) {
      res.status(200).json({ redirectUrl: "/src/pages/confirm_email.html" });
    }
  } catch (error) {
    console.error("falha ao encontrar dados");
  };

  try {
    const results = await sql`SELECT * FROM users WHERE email = ${email_user}`;
    if (results?.length > 0) {
      const {name, email, password, city, two_steps_authentication} = results[0];
      const passwordMatch = await bcrypt.compare(password_user, password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "E-mail ou senha incorretos." });
      };

      if (two_steps_authentication === "enabled") {
        // código para aplicativo de autenticação
      };

      const locationOrigin = await getUserLocation(ip);

      if(locationOrigin.city !== city) {
        const { emailAcessVerifyTemplate } = await getEmailTemplate(name, null, locationOrigin);
        const confirmLink = `https://gkptan.github.io/titanium-fitness/src/pages/confirm_acess.html?city=${encodeURIComponent(locationOrigin.city)}&region=${encodeURIComponent(locationOrigin.region)}`;

        const info = await transporter.sendMail({
          from: `"Academia Titanium Fitness" <${process.env.USER_MAIL}>`,
          to: email,
          subject: "Confirmação de acesso a sua conta",
          text: `Olá ${name}, recentemente sua conta foi logada na cidade: ${locationOrigin.city}, estado: ${locationOrigin.region}. Se não foi você, verifique sua conta clicando no link <a href="gkptan.github.io/titanium-fitness/src/pages/confirm_acess.html">verificar acesso</a>, atenciosamente, equipe Titanium Fitness`,
          html: emailAcessVerifyTemplate.replace("{{confirm_link}}", confirmLink)
        });

        console.log("email enviado:", info.messageId);
        res.status(403).json({ message: "acesso negado!"});
      }

      res.status(200).json({ redirectUrl: "/src/pages/home.html" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    console.log("Erro ao fazer login no site:", error);
    res.status(500).json({ message: "Erro interno no servidor, tente novamente mais tarde" });
  };
});

async function main(emails, names, location) {
  const { emailVerifyTemplate } = await getEmailTemplate(names, codeConfirm, location);

  try {
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
      html: emailVerifyTemplate,
    });
  
    console.log("e-mail enviado para: ", emails);
    console.log("e-mail enviado: ", info.messageId);
  } catch (error) {
    console.error("erro ao enviar e-mail", error);
    return res.status(500).json({ message: "erro ao enviar e-mail!"});
  };
}

// app.listen(PORT, () => {
//     console.log(`Servidor rodando em http://localhost:${PORT}`);
// });

export default app;

try {
    const key = await fs.readFile(path.join(__dirname, "../certificates/key.pem"));
    const cert = await fs.readFile(path.join(__dirname, "../certificates/cert.pem"));
    // const certSupabase = await fs.readFile(path.join(__dirname, "../certificates/prod-ca-2021.crt"));

    const options = { key, cert };

    https.createServer(options, app).listen(PORT, () => {
        console.log(`Servidor HTTPS rodando na porta ${PORT}`);
    });
} catch (error) {
    console.error("Erro ao criar servidor https: ", error);
};
