import sql from "../config/db.js";

export const findUnverifiedUserByEmail = async (email, id) => {
  if (!email && !id) {
    throw new Error("Email ou ID devem ser fornecidos.");
  }
  
  const safeEmail = email || null;
  const safeId = id || null;

  return await sql`SELECT * FROM unverified_users WHERE email = ${safeEmail} OR id = ${safeId}`;
};

export const insertUnverifiedUser = async (name, age, genre, email, password, confirm_code, ip, city, region, country, loc) => {

  return await sql`INSERT INTO unverified_users (name, age, gender, email, password, confirm_code, ip, city, region, country, location) VALUES (${name},${age},${genre},${email},${password},${confirm_code},${ip},${city},${region},${country},${loc})`;
};

export const updateUnverifiedUser = async (id) => {
  return await sql`UPDATE unverified_users SET verificado = 1 WHERE id = ${id}`;
};

export const insertUnverifiedUserInVerifiedUser = async (id) => {
  return await sql`INSERT INTO users (name, age, gender, email, password, verificado, ip, city, region, country, location) SELECT name, age, gender, email, password, 1, ip, city, region, country, location FROM unverified_users WHERE id = ${id}`;
};

export const deleteUnverifiedUser = async (id) => {
  return await sql`DELETE FROM unverified_users WHERE id = ${id}`;
};