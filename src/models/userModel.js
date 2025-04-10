import sql from "../config/db.js";

export const findUserByEmail = async (email) => {
  return await sql`SELECT * FROM users WHERE email = ${email}`;
};