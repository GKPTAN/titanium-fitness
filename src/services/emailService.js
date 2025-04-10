import nodemailer from "nodemailer";
import emailConfig from "../config/emailConfig.js";

export const sendEmailUser = async ({from, to, subject, text, html}) => {
  const transporter = nodemailer.createTransport(emailConfig);
  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log("E-mail enviado com sucesso!, id: ", info.messageId);
  } catch (error) {
    console.error("erro ao enviar e-mail", error);
    throw error;
  };
};