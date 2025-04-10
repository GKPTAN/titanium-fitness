import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import startHttpsServer from "../src/config/httpsServerConfig.js";
import authRoutes from "../src/routes/authRoutes.js";
import errorHandler from "../src/middlewares/errorMiddleware.js";

const app = express();
const PORT = 3000;

app.use(cors({
    origin: [
      "https://localhost:3000",
      "http://127.0.0.1:5500",
      "https://gkptan.github.io",
      "https://titanium-fitness.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;

// startHttpsServer(app, PORT);