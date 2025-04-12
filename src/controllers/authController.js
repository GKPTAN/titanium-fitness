import bcrypt from "bcrypt";
import getUserLocation from "../services/locationService.js";
import { sendEmailUser } from "../services/emailService.js";
import { findUnverifiedUserByEmail, insertUnverifiedUser, updateUnverifiedUser, insertUnverifiedUserInVerifiedUser, deleteUnverifiedUser } from "../models/unverifiedUserModel.js";
import { findUserByEmail } from "../models/userModel.js";
import getEmailTemplate from "../utils/emailTemplate.js";
import validarInput from "../utils/validationData.js";
import generateCodeConfirm from "../utils/codeGenerator.js";

export const loginController = async (req, res) => {
  const { email_user, password_user } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const unverifiedUser = await findUnverifiedUserByEmail(email_user);
    if (unverifiedUser?.length > 0) {
        return res.status(200).json({ redirectUrl: "titanium-fitness/src/pages/confirm_email.html"});
    };

    const user = await findUserByEmail(email_user);
    if (user?.length > 0) {
      const { name, email, password, city, two_steps_authentication } = user[0];
      const passwordMatch = await bcrypt.compare(password_user, password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "E-mail ou senha incorretos." });
      };

      if (two_steps_authentication === "enabled") {
        // código para aplicativo de autenticação
      };

      const locationOrigin = await getUserLocation(ip);

      if (email_user !== "testeadmin@teste.com") { // Exclui o e-mail de teste do sistema de verificação de localização

        if (locationOrigin.city !== city) {
          const { emailAcessVerifyTemplate } = await getEmailTemplate(name, null, locationOrigin);
  
          const confirmLink = `https://gkptan.github.io/titanium-fitness/src/pages/confirm_acess.html?city=${encodeURIComponent(locationOrigin.city)}&region=${encodeURIComponent(locationOrigin.region)}`;
  
          const info = await sendEmailUser({
            from: `"Academia Titanium Fitness" <${process.env.USER_MAIL}>`,
            to: email,
            subject: "Confirmação de acesso a sua conta",
            text: `Olá ${name}, recentemente sua conta foi logada na cidade: ${locationOrigin.city}, estado: ${locationOrigin.region}. Se não foi você, verifique sua conta clicando no link <a href="gkptan.github.io/titanium-fitness/src/pages/confirm_acess.html?city=${encodeURIComponent(locationOrigin.city)}&region=${encodeURIComponent(locationOrigin.region)}">verificar acesso</a>, atenciosamente, equipe Titanium Fitness`,
            html: emailAcessVerifyTemplate.replace("{{confirm_link}}", confirmLink)
          });
  
          res.status(403).json({ message: "acesso negado!"});
        };
      }

      res.status(200).json({ redirectUrl: "titanium-fitness/src/pages/home.html" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    console.log("Erro ao fazer login no site:", error);
    res.status(500).json({ message: "Erro interno no servidor, tente novamente mais tarde" });
  };
};

export const registroController = async (req, res) => {

  const { names, ages, genres, emails, password_user, password_conf } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress;
  const location = await getUserLocation(ip);
  const { city, region, country, loc } = location;

  if (country !== "Localização indisponível") {
    if (country !== "BR") {
      return res.status(400).json({
        message: "Somente pessoas que vivem no Brasil tem acesso a esse site!",
      });
    };
  };

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
  };

  try {
    const results = await findUserByEmail(emails);
    const resultsUnverified = await findUnverifiedUserByEmail(emails);

    if (results?.length > 0 || resultsUnverified?.length > 0) {
      return res.status(400).json({ message: "Este e-mail já está cadastrado!" });
    };

    const hashPassword = await bcrypt.hash(password_user, 10);
    const codeConfirmation = generateCodeConfirm();

    await insertUnverifiedUser(names, ages, genres, emails, hashPassword, codeConfirmation, ip, city, region, country, loc);

    const { emailVerifyTemplate } = await getEmailTemplate(names, codeConfirmation, location);

    try {
      await sendEmailUser({
        from: `"Academia Titanium Fitness" <${process.env.USER_MAIL}>`,
        to: emails,
        subject: "Código de Confirmação",
        text: `Olá ${names}, agradecemos por se cadastrar na nossa academia. Para ter acesso a sua conta, você precisa verificar seu e-mail com esse código de verificação que enviamos para você. Digite esse código na página de verificação: ${codeConfirmation}
            
            📍 Localização do pedido de registro:
            - Cidade: ${city}
            - Estado: ${region}
    
            ⚠️ Atenção: 
            - Não compartilhe este código. 
            - Nunca pediremos códigos por e-mail ou telefone.
            - Se você não solicitou este registro, ignore esta mensagem.`,
        html: emailVerifyTemplate,
      });
    } catch (error) {
      console.error("Erro ao enviar e-mail: ", error);
      await deleteUnverifiedUser(emails);
      return res.status(500).json({ message: "Erro ao enviar e-mail de confirmação. Tente novamente mais tarde" });
    };

    const user = await findUnverifiedUserByEmail(emails);

    if (user?.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    };

    const userId = user[0].id;

    res.cookie("user_id", userId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Cadastro realizado com sucesso.",
      redirectUrl: "titanium-fitness/src/pages/confirm_email.html",
    });
  } catch (error) {
    console.error("Erro ao registrar usuário: ", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  };
};

export const getUserIdController = async (req, res) => {
  const userId = req.cookies.user_id;

  console.log("Id do usuário:", userId);

  if (!userId || userId === null) {
    return res.status(401).json({ error: "Tempo de solicitação expirado.", message: "Erro no servidor." });
  };

  res.status(200).json({ userId });
};

export const verificationController = async (req, res) => {
  const { code, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "tempo de verificação expirado!" });
  };

  try {
    const user = await findUnverifiedUserByEmail(null, userId);

    if (user?.length > 0) {
      if (code !== user[0].confirm_code) {
        return res.status(400).json({ message: "Código inválido ou expirado!" });
      };

      await updateUnverifiedUser(userId);

      await insertUnverifiedUserInVerifiedUser(userId);

      await deleteUnverifiedUser(userId);

      res.clearCookie("user_id");

      res.status(200).json({
        message: "E-mail verificado com sucesso",
        redirectUrl: "titanium-fitness/src/pages/login.html",
      });
    } else {
      return res.status(404).json({ message: "Tempo de solicitação expirado!" });
    };
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  };
};

// export const resendConfirmationEmailController = async (req, res) => {
//   const user_id = req.cookies.user_id;

//   if (!user_id) {
//     return res.status(401).json({ message: "Usuário não autenticado." });
//   }

//   try {
//     const user = await findUnverifiedUserByEmail(null, user_id);

//     if (user?.length === 0) {
//       return res.status(404).json({ message: "Usuário não encontrado." });
//     };

//     const { name, emailSecret, codeConfirm, locationSecret } = user[0];
//     const { emailVerifyTemplate } = await getEmailTemplate(name, codeConfirm, locationSecret);
    
//     await sendEmailUser({
//       from: `"Academia Titanium Fitness" <${process.env.USER_MAIL}>`,
//       to: emailSecret,
//       subject: "Código de Confirmação",
//       text: `Olá ${name}, agradecemos por se cadastrar na nossa academia. Para ter acesso a sua conta, você precisa verificar seu e-mail com esse código de verificação que enviamos para você. Digite esse código na página de verificação: ${codeConfirm}
          
//            Localização do pedido de registro:
//           - Cidade: ${locationSecret.city}
//           - Estado: ${locationSecret.region}
  
//            Atenção: 
//           - Não compartilhe este código. 
//           - Nunca pediremos códigos por e-mail ou telefone.
//           - Se você não solicitou este registro, ignore esta mensagem.`,
//       html: emailVerifyTemplate,
//     });

//     res.status(200);
//   } catch (error) {
//     console.error("Erro ao reenviar e-mail de confirmação:", error);
//     res.status(500).json({ message: "Erro interno no servidor." });
//   };
// };