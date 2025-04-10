import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const emailConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.USER_PASS,
  },
};

export default emailConfig;