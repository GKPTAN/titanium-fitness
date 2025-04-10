import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { registroController } from "../controllers/authController";
import { response } from "express";
import errorHandler from "../middlewares/errorMiddleware.js";

// describe("Testes para o registroController", () => {
//     it("Deve retornar erro se os dados forem inválidos", async () => {
//         const req = {
//             headers: {
//                 "x-forwaded-for": "127.0.0.1",
//             },
//             body: {
//                 names: "lucas",
//                 ages: 18,
//                 genres: "Masculino",
//                 emails: "teste@teste.com",
//                 password_user: "18F1bVwMd",
//                 password_conf: "18F1bVwMd",
//             },
//         };

//         const res = {
//             status: vi.fn().mockReturnThis(),
//             json: vi.fn(),
//         };

//         await registroController(req, res);

//         expect(res.status).toHaveBeenCalledWith(400);
//     });
// });

// describe("Testes para a rota /api/auth/registro", () => {
  // it("Deve resgistrar um usuário com sucesso", async () => {
  //     const response = await request(app)
  //     .post("/api/auth/registro")
  //     .send({
  //         names: "Lucas",
  //         ages: 25,
  //         genres: "Masculino",
  //         emails: "santosamorim2001@gmail.com",
  //         password_user: "18F1bVwM",
  //         password_conf: "18F1bVwM",
  //     });

  //     expect(response.status).toBe(200);
  //     expect(response.body.message).toBe("Cadastro realizado com sucesso.")
  // });

  // it("Deve retornar erro para e-mail já registrado", async () => {
  //     const response = await request(app)
  //     .post("/api/auth/registro")
  //     .send({
  //         names: "Lucas",
  //         ages: 25,
  //         genres: "Masculino",
  //         emails: "santosamorim2001@gmail.com",
  //         password_user: "18F1bVwM",
  //         password_conf: "18F1bVwM",
  //     });

  //     expect(response.status).toBe(400);
  //     expect(response.body.message).toBe("Este e-mail já está cadastrado!");
  // });

//   it("retornar erro 400 para país invalido", async () => {
//     const req = {
//       headers: {
//         "x-forwarded-for": "8.8.8.8",
//       },
//       body: {
//         names: "lucas",
//         ages: 18,
//         genres: "Masculino",
//         emails: "teste@teste.com",
//         password_user: "18F1bVwM",
//         password_conf: "18F1bVwM",
//       },
//     };

//     const res = {
//       status: vi.fn().mockReturnThis(),
//       json: vi.fn(),
//     };

//     // vi.mock("../services/locationService.js", () => ({
//     //     default: vi.fn().mockResolvedValue({
//     //         city: "Mountain View",
//     //         region: "California",
//     //         country: "US",
//     //         loc: "37.4056,-122.0775",
//     //     }),
//     // }));

//     await registroController(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith(
//       { message: "Somente pessoas que vivem no Brasil tem acesso a esse site!" }
//     );
//   });
// });
describe("Teste para o errorMiddleware", () => {
  it("Deve retornar erro 500 para erro interno do servidor", () => {
    // Simula um erro
    const error = new Error("Algo deu errado!");

    // Mock dos objetos req, res e next
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    // Chama o middleware com o erro simulado
    errorHandler(error, req, res, next);

    // Verifica se o status foi definido como 500
    expect(res.status).toHaveBeenCalledWith(500);

    // Verifica se a resposta JSON contém a mensagem de erro
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
      error: "Algo deu errado!",
    });

    // Verifica se o next não foi chamado (porque o middleware finaliza a resposta)
    expect(next).not.toHaveBeenCalled();
  });
});