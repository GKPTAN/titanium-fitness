import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getEmailTemplate(name, codeConfirm, location) {
  try {
    const emailVerify = path.join(__dirname, "../templates/email.html");
    const emailAcessVerify = path.join(__dirname, "../templates/email_acess.html");

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
      .replace("{{region}}", location.region);

    return { emailVerifyTemplate, emailAcessVerifyTemplate };
  } catch (error) {
    console.error("Erro ao carregar o template de e-mail: ", error);
    return "";
  };
};

export default getEmailTemplate;